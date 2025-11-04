import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ErrorHandlers, successResponse } from '@/lib/apiResponse';
import { getChallengeForTrader, requireTrader } from '@/app/api/trading/_helpers';
import { TradeStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const trader = await requireTrader(request);

    if (!trader) {
      return ErrorHandlers.unauthorized('Trader authentication required');
    }

    const searchParams = request.nextUrl.searchParams;
    const challengeId = searchParams.get('challengeId')?.trim();

    if (!challengeId) {
      return ErrorHandlers.validationError('challengeId query parameter is required');
    }

    const challenge = await getChallengeForTrader(challengeId, trader.userId);

    if (!challenge) {
      return ErrorHandlers.notFound('Challenge not found');
    }

    const statusParam = searchParams.get('status')?.toUpperCase();
    const statusFilter =
      statusParam && Object.values(TradeStatus).includes(statusParam as TradeStatus)
        ? (statusParam as TradeStatus)
        : undefined;

    const page = Math.max(parseInt(searchParams.get('page') ?? '1', 10), 1);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get('limit') ?? '20', 10), 1),
      100,
    );
    const skip = (page - 1) * limit;

    const [trades, total] = await Promise.all([
      prisma.trade.findMany({
        where: {
          challengeId,
          ...(statusFilter ? { status: statusFilter } : {}),
        },
        orderBy: {
          entryTime: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.trade.count({
        where: {
          challengeId,
          ...(statusFilter ? { status: statusFilter } : {}),
        },
      }),
    ]);

    return successResponse({
      trades,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching trades:', error);
    return ErrorHandlers.serverError('Failed to fetch trades');
  }
}
