import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { ensureDatabase } from '@/lib/ensureDatabase';
import { ErrorHandlers } from '@/lib/apiResponse';

interface KycRequestBody {
  userId?: string;
  fullName?: string;
  phoneNumber?: string;
  idNumber?: string;
  address?: string;
}

export async function POST(request: Request) {
  try {
    await ensureDatabase();

    const body = (await request.json()) as KycRequestBody;
    const { userId, fullName, phoneNumber, idNumber, address } = body;

    if (!userId) {
      return ErrorHandlers.badRequest('User ID is required.');
    }

    if (!fullName || !phoneNumber || !idNumber || !address) {
      return ErrorHandlers.badRequest('All KYC fields are required.');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return ErrorHandlers.notFound('User not found.');
    }

    const trimmedFullName = fullName.trim();
    const trimmedPhoneNumber = phoneNumber.trim();
    const trimmedIdNumber = idNumber.trim();
    const trimmedAddress = address.trim();

    const kycRecord = await prisma.mockedKYC.upsert({
      where: { userId },
      update: {
        fullName: trimmedFullName,
        phoneNumber: trimmedPhoneNumber,
        idNumber: trimmedIdNumber,
        address: trimmedAddress,
        status: 'AUTO_APPROVED',
        approvedAt: new Date(),
      },
      create: {
        userId,
        fullName: trimmedFullName,
        phoneNumber: trimmedPhoneNumber,
        idNumber: trimmedIdNumber,
        address: trimmedAddress,
        status: 'AUTO_APPROVED',
      },
    });

    if (!user.name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: trimmedFullName },
      });
    }

    return NextResponse.json({
      message: 'KYC submitted and auto-approved.',
      kyc: {
        id: kycRecord.id,
        status: kycRecord.status,
        approvedAt: kycRecord.approvedAt,
        fullName: kycRecord.fullName,
        phoneNumber: kycRecord.phoneNumber,
        idNumber: kycRecord.idNumber,
        address: kycRecord.address,
      },
    });
  } catch (error) {
    console.error('KYC submission error:', error);
    return ErrorHandlers.serverError(
      'Unable to process KYC submission. Please try again later.',
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}
