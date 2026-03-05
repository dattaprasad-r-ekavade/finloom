import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { ensureDatabase } from '@/lib/ensureDatabase';
import { ErrorHandlers } from '@/lib/apiResponse';
import { requireRole } from '@/lib/apiAuth';

interface KycRequestBody {
  fullName?: string;
  phoneNumber?: string;
  panNumber?: string;
  dateOfBirth?: string;
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
    const { fullName, phoneNumber, panNumber, dateOfBirth, address } = body;

    if (!fullName || !phoneNumber || !panNumber || !dateOfBirth || !address) {
      return ErrorHandlers.badRequest('All KYC fields are required.');
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });

    if (!user) {
      return ErrorHandlers.notFound('User not found.');
    }

    const trimmedFullName = fullName.trim();
    const trimmedPhoneNumber = phoneNumber.trim();
    const trimmedPanNumber = panNumber.trim().toUpperCase();
    const trimmedDateOfBirth = dateOfBirth.trim();
    const trimmedAddress = address.trim();

    // Validate PAN format: 5 letters, 4 digits, 1 letter
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    if (!panRegex.test(trimmedPanNumber)) {
      return ErrorHandlers.badRequest('Invalid PAN number format (e.g. ABCDE1234F).');
    }

    const kycRecord = await prisma.mockedKYC.upsert({
      where: { userId: session.userId },
      update: {
        fullName: trimmedFullName,
        phoneNumber: trimmedPhoneNumber,
        panNumber: trimmedPanNumber,
        dateOfBirth: trimmedDateOfBirth,
        address: trimmedAddress,
        status: 'PENDING',
        approvedAt: null,
        approvedBy: null,
        rejectedAt: null,
        rejectedBy: null,
        rejectionReason: null,
      },
      create: {
        userId: session.userId,
        fullName: trimmedFullName,
        phoneNumber: trimmedPhoneNumber,
        panNumber: trimmedPanNumber,
        dateOfBirth: trimmedDateOfBirth,
        address: trimmedAddress,
        status: 'PENDING',
      },
    });

    if (!user.name) {
      await prisma.user.update({
        where: { id: session.userId },
        data: { name: trimmedFullName },
      });
    }

    return NextResponse.json({
      message: 'KYC submitted successfully. Our team will review your details within 1–2 business days.',
      kyc: {
        id: kycRecord.id,
        status: kycRecord.status,
        fullName: kycRecord.fullName,
        phoneNumber: maskSensitive(kycRecord.phoneNumber),
        panNumber: maskSensitive(trimmedPanNumber),
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
