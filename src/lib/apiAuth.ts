import type { NextRequest } from 'next/server';
import { UserRole } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { JWTPayload, verifyToken } from '@/lib/jwt';

export interface AuthenticatedSession {
  userId: string;
  email: string;
  role: UserRole;
  name?: string | null;
}

function parseCookieHeader(cookieHeader: string, key: string): string | null {
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const [rawName, ...rawValue] = part.trim().split('=');
    if (rawName === key) {
      return decodeURIComponent(rawValue.join('='));
    }
  }
  return null;
}

function getCookieValue(request: Request | NextRequest, key: string): string | null {
  if ('cookies' in request && typeof request.cookies.get === 'function') {
    return request.cookies.get(key)?.value ?? null;
  }

  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) {
    return null;
  }

  return parseCookieHeader(cookieHeader, key);
}

async function buildSessionFromPayload(payload: JWTPayload): Promise<AuthenticatedSession | null> {
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
}

export async function getAuthenticatedSession(
  request: Request | NextRequest,
): Promise<AuthenticatedSession | null> {
  const token = getCookieValue(request, 'auth-token');

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  return buildSessionFromPayload(payload);
}

export async function requireAuthenticatedSession(
  request: Request | NextRequest,
): Promise<AuthenticatedSession | null> {
  return getAuthenticatedSession(request);
}

export async function requireRole(
  request: Request | NextRequest,
  role: UserRole,
): Promise<AuthenticatedSession | null> {
  const session = await getAuthenticatedSession(request);
  if (!session || session.role !== role) {
    return null;
  }

  return session;
}

export async function requireOneOfRoles(
  request: Request | NextRequest,
  roles: UserRole[],
): Promise<AuthenticatedSession | null> {
  const session = await getAuthenticatedSession(request);
  if (!session || !roles.includes(session.role)) {
    return null;
  }

  return session;
}
