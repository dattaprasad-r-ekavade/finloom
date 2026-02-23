import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requireAuthenticatedSession,
  requireRole,
  AuthenticatedSession,
} from '@/lib/apiAuth';

export async function authenticateRequest(
  request: NextRequest,
): Promise<AuthenticatedSession | null> {
  return requireAuthenticatedSession(request);
}

export async function requireTrader(
  request: NextRequest,
): Promise<AuthenticatedSession | null> {
  return requireRole(request, 'TRADER');
}

export async function requireAdmin(
  request: NextRequest,
): Promise<AuthenticatedSession | null> {
  return requireRole(request, 'ADMIN');
}

export async function getChallengeForTrader(challengeId: string, userId: string) {
  if (!challengeId) {
    return null;
  }

  return prisma.userChallenge.findFirst({
    where: {
      id: challengeId,
      userId,
    },
    include: {
      plan: true,
    },
  });
}
