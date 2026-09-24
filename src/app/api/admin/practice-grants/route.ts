import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ErrorHandlers, errorResponse, successResponse } from '@/lib/apiResponse';
import { requireRole } from '@/lib/apiAuth';

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_PILOT_GRANTS !== 'true') {
    return errorResponse('Pilot grants are disabled.', 404);
  }
  const admin = await requireRole(request, 'ADMIN');
  if (!admin) return ErrorHandlers.unauthorized();
  let userId: string;
  try {
    const body = await request.json();
    userId = typeof body.userId === 'string' ? body.userId.trim() : '';
  } catch { return ErrorHandlers.badRequest('Invalid request.'); }
  if (!userId) return ErrorHandlers.validationError('userId is required.');

  const [user, plan] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
    prisma.challengePlan.findFirst({ where: { isActive: true, level: 1 }, orderBy: { createdAt: 'asc' } }),
  ]);
  if (!user || user.role !== 'TRADER' || !plan) return ErrorHandlers.notFound('Trader or level-one plan not found.');
  const existing = await prisma.userChallenge.findFirst({ where: { userId, status: 'ACTIVE' } });
  if (existing) return ErrorHandlers.conflict('Trader already has an active challenge.');
  const challenge = await prisma.userChallenge.create({ data: {
    userId, planId: plan.id, status: 'ACTIVE', isDemo: true,
    demoGrantedBy: admin.userId, startDate: new Date(),
  } });
  return successResponse({ challenge });
}
