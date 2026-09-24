import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ErrorHandlers, errorResponse, successResponse } from '@/lib/apiResponse';
import { requireAdmin } from '@/app/api/trading/_helpers';
import { closePosition } from '@/lib/orderService';

async function run(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return errorResponse('Customer trading is disabled in this preview.', 503);
  }
  const secret = process.env.CRON_SECRET;
  const authorized = Boolean(secret && (
    request.headers.get('authorization') === `Bearer ${secret}` ||
    request.headers.get('x-cron-secret') === secret
  ));
  if (!authorized && !(await requireAdmin(request))) return ErrorHandlers.unauthorized();

  let challengeId: string | undefined;
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      if (typeof body.challengeId === 'string') challengeId = body.challengeId.trim();
    } catch { /* all open positions */ }
  }
  const openTrades = await prisma.trade.findMany({
    where: { status: 'OPEN', ...(challengeId ? { challengeId } : {}) },
    select: { id: true, challenge: { select: { userId: true } } },
    take: 50,
    orderBy: { entryTime: 'asc' },
  });
  const closedTrades = [];
  const skipped = [];
  for (const trade of openTrades) {
    try {
      const result = await closePosition(trade.id, trade.challenge.userId, true);
      if (!result.replay) closedTrades.push(result.trade);
    } catch (error) {
      skipped.push({ tradeId: trade.id, reason: error instanceof Error ? error.message : 'Close failed' });
    }
  }
  return successResponse({ closedTrades, skipped, remainingPossible: openTrades.length === 50 });
}

export const GET = run;
export const POST = run;
