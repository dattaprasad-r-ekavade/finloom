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

    // Check if auto-approve is enabled in settings
    let settings = await prisma.adminSettings.findFirst();
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.adminSettings.create({
        data: { autoApproveKyc: false },
      });
    }

    const shouldAutoApprove = settings.autoApproveKyc;
    const kycStatus = shouldAutoApprove ? 'AUTO_APPROVED' : 'PENDING';
    const approvalDate = shouldAutoApprove ? new Date() : null;

    const kycRecord = await prisma.mockedKYC.upsert({
      where: { userId },
      update: {
        fullName: trimmedFullName,
        phoneNumber: trimmedPhoneNumber,
        idNumber: trimmedIdNumber,
        address: trimmedAddress,
        status: kycStatus,
        approvedAt: approvalDate,
      },
      create: {
        userId,
        fullName: trimmedFullName,
        phoneNumber: trimmedPhoneNumber,
        idNumber: trimmedIdNumber,
        address: trimmedAddress,
        status: kycStatus,
        approvedAt: approvalDate,
      },
    });

    if (!user.name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: trimmedFullName },
      });
    }

    return NextResponse.json({
      message: shouldAutoApprove 
        ? 'KYC submitted and auto-approved.' 
        : 'KYC submitted successfully. Pending admin approval.',
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
