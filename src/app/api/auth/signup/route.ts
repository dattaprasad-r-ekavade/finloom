import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prisma';

interface SignupRequestBody {
  email?: string;
  password?: string;
  name?: string;
  role?: 'TRADER' | 'ADMIN';
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupRequestBody;
    const { email, password, name, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const normalisedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalisedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: normalisedEmail,
        passwordHash,
        name,
        role: role === 'ADMIN' ? 'ADMIN' : 'TRADER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: 'Account created successfully.',
      user,
    });
  } catch (error) {
    console.error('Signup error', error);
    return NextResponse.json(
      { error: 'Unable to create account. Please try again later.' },
      { status: 500 }
    );
  }
}
