import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prisma';
import { ensureDatabase } from '@/lib/ensureDatabase';
import { signToken } from '@/lib/jwt';
import { ErrorHandlers, successResponse, validateRequiredFields, isValidEmail } from '@/lib/apiResponse';

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

    // Validate required fields
    if (!email || !password) {
      return ErrorHandlers.badRequest('Email and password are required');
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return ErrorHandlers.badRequest('Please enter a valid email address');
    }

    const normalisedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalisedEmail },
      include: { mockedKyc: true },
    });

    if (!user) {
      return ErrorHandlers.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return ErrorHandlers.unauthorized('Invalid email or password');
    }

    // Check if the user's role matches the expected role (if provided)
    if (expectedRole && user.role !== expectedRole) {
      return ErrorHandlers.forbidden(
        `This portal is for ${expectedRole === 'ADMIN' ? 'administrators' : 'traders'} only. Please use the correct login page.`
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

    // Generate JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Create response using NextResponse
    const response = NextResponse.json({
      message: 'Signed in successfully.',
      user: responseUser,
      success: true,
    });

    // Set cookie using NextResponse cookies API
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return ErrorHandlers.serverError(
      'Unable to sign in. Please try again later.',
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}
