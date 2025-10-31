import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user from database to ensure they still exist
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        mockedKyc: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const responseUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      kycStatus: user.mockedKyc ? user.mockedKyc.status : ('NOT_SUBMITTED' as const),
      hasCompletedKyc: Boolean(user.mockedKyc),
    };

    return NextResponse.json({
      user: responseUser,
    });
  } catch (error) {
    console.error('Get current user error', error);
    return NextResponse.json(
      { error: 'Unable to get user data' },
      { status: 500 }
    );
  }
}
