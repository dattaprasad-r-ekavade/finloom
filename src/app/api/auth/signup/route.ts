import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prisma';
import { ensureDatabase } from '@/lib/ensureDatabase';
import { signToken } from '@/lib/jwt';
import { ErrorHandlers, isValidEmail, isValidPassword } from '@/lib/apiResponse';

interface SignupRequestBody {
  email?: string;
  password?: string;
  name?: string;
  role?: 'TRADER' | 'ADMIN';
}

export async function POST(request: Request) {
  try {
    await ensureDatabase();

    const body = (await request.json()) as SignupRequestBody;
    const { email, password, name, role } = body;

    if (!email || !password) {
      return ErrorHandlers.badRequest('Email and password are required.');
    }

    if (!isValidEmail(email)) {
      return ErrorHandlers.badRequest('Please provide a valid email address.');
    }

    if (!isValidPassword(password)) {
      return ErrorHandlers.badRequest('Password must be at least 8 characters long.');
    }

    const resolvedRole: 'TRADER' | 'ADMIN' = 'TRADER';
    if (role === 'ADMIN') {
      return ErrorHandlers.forbidden(
        'Admin self-signup is disabled. Use local admin credential manager.',
      );
    }

    const normalisedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalisedEmail },
    });

    if (existingUser) {
      return ErrorHandlers.conflict('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: normalisedEmail,
        passwordHash,
        name,
        role: resolvedRole,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    const responseUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      kycStatus: 'NOT_SUBMITTED' as const,
      hasCompletedKyc: false,
    };

    // Generate JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Create response with cookie
    const response = NextResponse.json({
      message: 'Account created successfully.',
      user: responseUser,
    });

    // Set HTTP-only cookie with JWT token
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return ErrorHandlers.serverError(
      'Unable to create account. Please try again later.',
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}
