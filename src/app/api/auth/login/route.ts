import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prisma';
import { ensureDatabase } from '@/lib/ensureDatabase';

interface LoginRequestBody {
  email?: string;
  password?: string;
  expectedRole?: 'ADMIN' | 'TRADER';
}

export async function POST(request: Request) {
  try {
    await ensureDatabase();

    const body = (await request.json()) as LoginRequestBody;
    const { email, password, expectedRole } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const normalisedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalisedEmail },
      include: { mockedKyc: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Check if the user's role matches the expected role (if provided)
    if (expectedRole && user.role !== expectedRole) {
      return NextResponse.json(
        { error: `This portal is for ${expectedRole === 'ADMIN' ? 'administrators' : 'traders'} only. Please use the correct login page.` },
        { status: 403 }
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
      message: 'Signed in successfully.',
      user: responseUser,
    });
  } catch (error) {
    console.error('Login error', error);
    return NextResponse.json(
      { error: 'Unable to sign in. Please try again later.' },
      { status: 500 }
    );
  }
}
