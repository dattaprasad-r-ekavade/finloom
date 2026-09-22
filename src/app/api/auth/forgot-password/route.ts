import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/apiResponse';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return errorResponse('Email is required.', 400);
    }

    const normalisedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalisedEmail },
    });

    // Always return success to avoid email enumeration
    const genericSuccess = NextResponse.json({
      message: 'If an account with that email exists, reset instructions will be sent.',
    });

    if (!user) return genericSuccess;

    if (process.env.NODE_ENV === 'production') {
      return errorResponse('Password recovery is temporarily unavailable. Please contact support.', 503);
    }

    // Generate a secure random token for the local development flow.
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpiry: expiry,
      },
    });

    return NextResponse.json({
      message: 'If an account with that email exists, reset instructions will be sent.',
      resetToken: rawToken,
      expiresAt: expiry,
    });
  } catch (error) {
    console.error('[ForgotPassword] Error:', error);
    return errorResponse('An unexpected error occurred.', 500);
  }
}
