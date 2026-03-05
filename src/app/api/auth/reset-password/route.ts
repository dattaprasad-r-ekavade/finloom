import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/apiResponse';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, newPassword } = body;

    if (!token || typeof token !== 'string') {
      return errorResponse('Reset token is required.', 400);
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return errorResponse('New password is required.', 400);
    }

    if (newPassword.length < 8) {
      return errorResponse('Password must be at least 8 characters.', 400);
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return errorResponse(
        'This reset link is invalid or has expired. Please request a new one.',
        400
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    return NextResponse.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('[ResetPassword] Error:', error);
    return errorResponse('An unexpected error occurred.', 500);
  }
}
