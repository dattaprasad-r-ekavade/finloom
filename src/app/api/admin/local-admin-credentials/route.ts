import { NextResponse } from 'next/server';

import { ensureDatabase } from '@/lib/ensureDatabase';
import { ErrorHandlers, isValidEmail, isValidPassword } from '@/lib/apiResponse';
import { prisma } from '@/lib/prisma';
import {
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_NAME,
  DEFAULT_ADMIN_PASSWORD,
  ensurePrimaryAdminUser,
  getPrimaryAdminUser,
  updatePrimaryAdminUser,
} from '@/lib/adminAccount';

function isLocalRequest(request: Request): boolean {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }

  const hostHeader = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const host = hostHeader.split(':')[0]?.trim().toLowerCase();
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

export async function GET(request: Request) {
  try {
    if (!isLocalRequest(request)) {
      return ErrorHandlers.forbidden('This endpoint is only available on local development.');
    }

    await ensureDatabase();
    const user = await ensurePrimaryAdminUser();

    return NextResponse.json({
      success: true,
      data: {
        email: user.email,
        name: user.name,
        role: user.role,
        defaultCredentials: {
          email: DEFAULT_ADMIN_EMAIL,
          password: DEFAULT_ADMIN_PASSWORD,
          name: DEFAULT_ADMIN_NAME,
        },
      },
    });
  } catch (error) {
    return ErrorHandlers.serverError(
      'Unable to fetch local admin credentials.',
      process.env.NODE_ENV === 'development' ? error : undefined,
    );
  }
}

interface UpdateBody {
  email?: string;
  password?: string;
  name?: string;
}

export async function PUT(request: Request) {
  try {
    if (!isLocalRequest(request)) {
      return ErrorHandlers.forbidden('This endpoint is only available on local development.');
    }

    await ensureDatabase();
    await ensurePrimaryAdminUser();

    const body = (await request.json()) as UpdateBody;
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? '';
    const name = body.name?.trim();

    if (!email || !password) {
      return ErrorHandlers.badRequest('Email and password are required.');
    }

    if (!isValidEmail(email)) {
      return ErrorHandlers.badRequest('Please provide a valid email address.');
    }

    if (!isValidPassword(password)) {
      return ErrorHandlers.badRequest('Password must be at least 8 characters long.');
    }

    const existingUser = await getPrimaryAdminUser();
    const matched = await prisma.user.findUnique({ where: { email } });
    const conflict = Boolean(matched && existingUser && matched.id !== existingUser.id);

    if (conflict) {
      return ErrorHandlers.conflict('Another user already uses this email address.');
    }

    const updated = await updatePrimaryAdminUser({ email, password, name });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return ErrorHandlers.serverError(
      'Unable to update local admin credentials.',
      process.env.NODE_ENV === 'development' ? error : undefined,
    );
  }
}
