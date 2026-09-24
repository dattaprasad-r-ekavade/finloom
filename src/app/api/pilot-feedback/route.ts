import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ErrorHandlers, successResponse } from '@/lib/apiResponse';
import { requireRole } from '@/lib/apiAuth';

export async function POST(request: NextRequest) {
  const user = await requireRole(request, 'TRADER');
  if (!user) return ErrorHandlers.unauthorized();
  let body: { rating?: unknown; message?: unknown; challengeId?: unknown };
  try { body = await request.json(); } catch { return ErrorHandlers.badRequest('Invalid feedback.'); }
  if (!Number.isInteger(body.rating) || Number(body.rating) < 1 || Number(body.rating) > 5 ||
      typeof body.message !== 'string' || body.message.trim().length < 5 || body.message.length > 2000) {
    return ErrorHandlers.validationError('Give a rating from 1 to 5 and a message of 5–2000 characters.');
  }
  const challengeId = typeof body.challengeId === 'string' ? body.challengeId : null;
  if (challengeId && !(await prisma.userChallenge.findFirst({ where: { id: challengeId, userId: user.userId } }))) {
    return ErrorHandlers.forbidden('Challenge does not belong to this account.');
  }
  const feedback = await prisma.pilotFeedback.create({ data: {
    userId: user.userId, challengeId, rating: Number(body.rating), message: body.message.trim(),
  } });
  return successResponse({ id: feedback.id }, 'Feedback saved.', 201);
}

export async function GET(request: NextRequest) {
  const admin = await requireRole(request, 'ADMIN');
  if (!admin) return ErrorHandlers.unauthorized();
  const feedback = await prisma.pilotFeedback.findMany({
    take: 100, orderBy: { createdAt: 'desc' },
    select: { id: true, createdAt: true, rating: true, message: true, challengeId: true,
      user: { select: { email: true, name: true } } },
  });
  return successResponse({ feedback });
}
