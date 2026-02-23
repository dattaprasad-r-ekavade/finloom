import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { ensureDatabase } from '@/lib/ensureDatabase';
import { ErrorHandlers } from '@/lib/apiResponse';
import { requireRole } from '@/lib/apiAuth';

interface KycRequestBody {
  fullName?: string;
  phoneNumber?: string;
  idNumber?: string;
  address?: string;
}

function maskSensitive(value: string): string {
  if (value.length <= 4) {
    return '****';
  }
  return `${'*'.repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(request, 'TRADER');
    if (!session) {
      return ErrorHandlers.unauthorized('Trader authentication required.');
    }

    await ensureDatabase();

    const body = (await request.json()) as KycRequestBody;
    const { fullName, phoneNumber, idNumber, address } = body;

    if (!fullName || !phoneNumber || !idNumber || !address) {
      return ErrorHandlers.badRequest('All KYC fields are required.');
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });

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
      where: { userId: session.userId },
      update: {
        fullName: trimmedFullName,
        phoneNumber: trimmedPhoneNumber,
        idNumber: trimmedIdNumber,
        address: trimmedAddress,
        status: kycStatus,
        approvedAt: approvalDate,
      },
      create: {
        userId: session.userId,
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
        where: { id: session.userId },
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
        phoneNumber: maskSensitive(kycRecord.phoneNumber),
        idNumber: maskSensitive(kycRecord.idNumber),
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
