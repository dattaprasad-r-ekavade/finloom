import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return errorResponse('Email is required.', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Always return success to avoid email enumeration
    const genericSuccess = NextResponse.json({
      message: 'If an account with that email exists, reset instructions will be sent.',
    });

    if (!user) return genericSuccess;

    // Generate a secure random token
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

    // In production this would be sent via email.
    // For now, expose the raw token in development mode for testing.
    const isDev = process.env.NODE_ENV === 'development';

    console.log(`[ForgotPassword] Reset token for ${email}: ${rawToken}`);

    return NextResponse.json({
      message: 'If an account with that email exists, reset instructions will be sent.',
      ...(isDev && { resetToken: rawToken, expiresAt: expiry }),
    });
  } catch (error) {
    console.error('[ForgotPassword] Error:', error);
    return errorResponse('An unexpected error occurred.', 500);
  }
}
