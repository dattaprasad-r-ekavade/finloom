import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ErrorHandlers, errorResponse, successResponse } from '@/lib/apiResponse';
import { getChallengeForTrader, requireTrader } from '@/app/api/trading/_helpers';
import { TradeStatus } from '@prisma/client';
import { freshQuoteMap, quoteKey, QuoteUnavailable } from '@/lib/tradeQuotes';
import { internalDevelopmentOnlyResponse } from '@/lib/internalDevelopment';
import { calculateUnrealizedPnl } from '@/lib/tradingUtils';

export async function GET(request: NextRequest) {
  const blocked = internalDevelopmentOnlyResponse();
  if (blocked) return blocked;
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

    const openTrades = trades.filter((trade) => trade.status === TradeStatus.OPEN);
    const priceMap = await freshQuoteMap(openTrades);

    const enrichedTrades = trades.map((trade) => {
      if (trade.status !== TradeStatus.OPEN) {
        return trade;
      }

      const currentPrice = priceMap.get(quoteKey(trade))!.ltp;
      return {
        ...trade,
        currentPrice,
        livePnl: calculateUnrealizedPnl(trade, currentPrice),
      };
    });

    return successResponse({
      trades: enrichedTrades,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof QuoteUnavailable) return errorResponse(error.message, 409);
    console.error('Error fetching trades:', error);
    return ErrorHandlers.serverError('Failed to fetch trades');
  }
}
