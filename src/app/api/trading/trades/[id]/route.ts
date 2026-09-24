import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ErrorHandlers, successResponse } from '@/lib/apiResponse';
import { requireRole } from '@/lib/apiAuth';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const trader = await requireRole(request, 'TRADER');
  if (!trader) return ErrorHandlers.unauthorized();
  const { id } = await context.params;
  let body: { reviewNote?: unknown };
  try { body = await request.json(); } catch { return ErrorHandlers.badRequest('Invalid review.'); }
  if (typeof body.reviewNote !== 'string' || body.reviewNote.trim().length > 500) {
    return ErrorHandlers.validationError('Review must be 500 characters or fewer.');
  }
  const trade = await prisma.trade.findFirst({ where: { id, challenge: { userId: trader.userId } } });
  if (!trade) return ErrorHandlers.notFound('Trade not found.');
  if (trade.status !== 'CLOSED') return ErrorHandlers.conflict('Close the trade before reviewing it.');
  const updated = await prisma.trade.update({ where: { id }, data: { reviewNote: body.reviewNote.trim() } });
  return successResponse({ trade: updated });
}
