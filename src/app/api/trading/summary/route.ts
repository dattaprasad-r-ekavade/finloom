import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ErrorHandlers, errorResponse, successResponse } from '@/lib/apiResponse';
import {
  calculateRequiredCapital,
  calculateUnrealizedPnl,
  getISTStartOfDay,
  isMarketOpen,
} from '@/lib/tradingUtils';
import { getChallengeForTrader, requireTrader } from '@/app/api/trading/_helpers';
import { TradeStatus } from '@prisma/client';
import { freshQuoteMap, quoteKey, QuoteUnavailable } from '@/lib/tradeQuotes';
import { internalDevelopmentOnlyResponse } from '@/lib/internalDevelopment';

function parseDateParam(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

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

    const dateParam = parseDateParam(searchParams.get('date'));
    const dayStart = getISTStartOfDay(dateParam ?? new Date());
    const nextDayStart = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const [summary, openTrades, aggregateRealized, realizedToday, closedTradesToday] =
      await Promise.all([
        prisma.dailyTradeSummary.findUnique({
          where: {
            challengeId_date: {
              challengeId,
              date: dayStart,
            },
          },
        }),
        prisma.trade.findMany({
          where: {
            challengeId,
            status: TradeStatus.OPEN,
          },
        }),
        prisma.trade.aggregate({
          where: {
            challengeId,
            status: TradeStatus.CLOSED,
          },
          _sum: {
            pnl: true,
          },
        }),
        prisma.trade.aggregate({
          where: {
            challengeId,
            status: TradeStatus.CLOSED,
            exitTime: {
              gte: dayStart,
              lt: nextDayStart,
            },
          },
          _sum: {
            pnl: true,
          },
        }),
        prisma.trade.count({
          where: {
            challengeId,
            status: TradeStatus.CLOSED,
            exitTime: {
              gte: dayStart,
              lt: nextDayStart,
            },
          },
        }),
      ]);

    const priceMap = await freshQuoteMap(openTrades);

    const capitalUsed = openTrades.reduce((total, trade) => {
      const ltp = priceMap.get(quoteKey(trade))!.ltp;
      return total + calculateRequiredCapital(trade.quantity, ltp);
    }, 0);

    const unrealizedPnl = openTrades.reduce((total, trade) => {
      const ltp = priceMap.get(quoteKey(trade))!.ltp;
      return total + calculateUnrealizedPnl(trade, ltp);
    }, 0);

    const realizedSum = aggregateRealized._sum.pnl ?? 0;
    const realizedLoss = realizedSum < 0 ? Math.abs(realizedSum) : 0;
    const capitalAvailable = challenge.plan.accountSize - capitalUsed - realizedLoss;

    const realizedPnlToday = realizedToday._sum.pnl ?? 0;
    const dayPnlPct =
      ((realizedPnlToday + unrealizedPnl) / challenge.plan.accountSize) * 100;

    return successResponse({
      summary: summary ?? null,
      challenge: {
        id: challenge.id,
        status: challenge.status,
        accountSize: challenge.plan.accountSize,
      },
      metrics: {
        openTradesCount: openTrades.length,
        closedTradesToday: closedTradesToday,
        realizedPnlToday,
        dayPnlPct: Number(dayPnlPct.toFixed(4)),
      },
      portfolio: {
        capitalUsed,
        capitalAvailable: Math.max(0, capitalAvailable),
        unrealizedPnl,
        realizedPnl: realizedSum,
        isMarketOpen: isMarketOpen(),
      },
    });
  } catch (error) {
    if (error instanceof QuoteUnavailable) return errorResponse(error.message, 409);
    console.error('Error fetching trading summary:', error);
    return ErrorHandlers.serverError('Failed to fetch trading summary');
  }
}
