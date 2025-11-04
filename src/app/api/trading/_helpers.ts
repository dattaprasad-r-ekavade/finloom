import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, JWTPayload } from '@/lib/jwt';

export async function authenticateRequest(request: NextRequest): Promise<JWTPayload | null> {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return null;
  }

  return verifyToken(token);
}

export async function requireTrader(request: NextRequest): Promise<JWTPayload | null> {
  const payload = await authenticateRequest(request);
  if (!payload || payload.role !== 'TRADER') {
    return null;
  }
  return payload;
}

export async function requireAdmin(request: NextRequest): Promise<JWTPayload | null> {
  const payload = await authenticateRequest(request);
  if (!payload || payload.role !== 'ADMIN') {
    return null;
  }
  return payload;
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
