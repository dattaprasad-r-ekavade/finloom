import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ErrorHandlers, successResponse } from '@/lib/apiResponse';
import {
  calculateRequiredCapital,
  calculateUnrealizedPnl,
  getISTStartOfDay,
} from '@/lib/tradingUtils';
import { requireTrader } from '@/app/api/trading/_helpers';
import { TradeStatus, TradeType } from '@prisma/client';

interface SquareOffBody {
  tradeId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const trader = await requireTrader(request);

    if (!trader) {
      return ErrorHandlers.unauthorized('Trader authentication required');
    }

    const body = (await request.json()) as SquareOffBody;
    const tradeId = body.tradeId?.trim();

    if (!tradeId) {
      return ErrorHandlers.validationError('tradeId is required');
    }

    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: {
        challenge: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!trade) {
      return ErrorHandlers.notFound('Trade not found');
    }

    if (trade.challenge.userId !== trader.userId) {
      return ErrorHandlers.forbidden('You are not authorized to modify this trade');
    }

    if (trade.status !== TradeStatus.OPEN) {
      return ErrorHandlers.badRequest('Trade is already closed');
    }

    const marketData = await prisma.mockedMarketData.findUnique({
      where: { scrip: trade.scrip },
    });

    if (!marketData) {
      return ErrorHandlers.notFound('Market data unavailable for this scrip');
    }

    const exitPrice = marketData.ltp;
    const direction = trade.tradeType === TradeType.BUY ? 1 : -1;
    const realizedPnl =
      direction * (exitPrice - trade.entryPrice) * trade.quantity;

    const closedTrade = await prisma.trade.update({
      where: { id: tradeId },
      data: {
        status: TradeStatus.CLOSED,
        exitPrice,
        exitTime: new Date(),
        pnl: Number(realizedPnl.toFixed(2)),
        autoSquaredOff: false,
      },
    });

    const todayStart = getISTStartOfDay();
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const [openTrades, aggregateRealized, closedTradesTodayCount, realizedToday] =
      await Promise.all([
        prisma.trade.findMany({
          where: {
            challengeId: trade.challengeId,
            status: TradeStatus.OPEN,
          },
        }),
        prisma.trade.aggregate({
          where: {
            challengeId: trade.challengeId,
            status: TradeStatus.CLOSED,
          },
          _sum: {
            pnl: true,
          },
        }),
        prisma.trade.count({
          where: {
            challengeId: trade.challengeId,
            status: TradeStatus.CLOSED,
            exitTime: {
              gte: todayStart,
              lt: tomorrowStart,
            },
          },
        }),
        prisma.trade.aggregate({
          where: {
            challengeId: trade.challengeId,
            status: TradeStatus.CLOSED,
            exitTime: {
              gte: todayStart,
              lt: tomorrowStart,
            },
          },
          _sum: {
            pnl: true,
          },
        }),
      ]);

    const scripsToFetch = Array.from(
      new Set(openTrades.map((openTrade) => openTrade.scrip)),
    );
    const marketSnapshots = scripsToFetch.length
      ? await prisma.mockedMarketData.findMany({
          where: { scrip: { in: scripsToFetch } },
        })
      : [];

    const priceMap = new Map<string, number>();
    marketSnapshots.forEach((snapshot) =>
      priceMap.set(snapshot.scrip, snapshot.ltp),
    );

    const capitalUsed = openTrades.reduce((total, openTrade) => {
      const ltp = priceMap.get(openTrade.scrip) ?? openTrade.entryPrice;
      return total + calculateRequiredCapital(openTrade.quantity, ltp);
    }, 0);

    const unrealizedPnl = openTrades.reduce((total, openTrade) => {
      const ltp = priceMap.get(openTrade.scrip) ?? openTrade.entryPrice;
      return total + calculateUnrealizedPnl(openTrade, ltp);
    }, 0);

    const realizedSum = aggregateRealized._sum.pnl ?? 0;
    const realizedLoss = realizedSum < 0 ? Math.abs(realizedSum) : 0;
    const capitalAvailable =
      trade.challenge.plan.accountSize - capitalUsed - realizedLoss;

    const tradesTodayCount = await prisma.trade.count({
      where: {
        challengeId: trade.challengeId,
        entryTime: {
          gte: todayStart,
          lt: tomorrowStart,
        },
      },
    });

    const realizedPnlToday = realizedToday._sum.pnl ?? 0;
    const dayPnlPct =
      ((realizedPnlToday + unrealizedPnl) / trade.challenge.plan.accountSize) *
      100;

    const summary = await prisma.dailyTradeSummary.upsert({
      where: {
        challengeId_date: {
          challengeId: trade.challengeId,
          date: todayStart,
        },
      },
      create: {
        challengeId: trade.challengeId,
        date: todayStart,
        totalTrades: tradesTodayCount,
        openTrades: openTrades.length,
        closedTrades: closedTradesTodayCount,
        realizedPnl: realizedPnlToday,
        unrealizedPnl,
        capitalUsed,
        capitalAvailable: Math.max(0, capitalAvailable),
        dayPnlPct: Number(dayPnlPct.toFixed(4)),
      },
      update: {
        totalTrades: tradesTodayCount,
        openTrades: openTrades.length,
        closedTrades: closedTradesTodayCount,
        realizedPnl: realizedPnlToday,
        unrealizedPnl,
        capitalUsed,
        capitalAvailable: Math.max(0, capitalAvailable),
        dayPnlPct: Number(dayPnlPct.toFixed(4)),
      },
    });

    await prisma.userChallenge.update({
      where: { id: trade.challengeId },
      data: {
        currentPnl: realizedSum + unrealizedPnl,
      },
    });

    return successResponse({
      trade: closedTrade,
      summary,
      portfolio: {
        capitalUsed,
        capitalAvailable: Math.max(0, capitalAvailable),
        unrealizedPnl,
        realizedPnl: realizedSum,
      },
    });
  } catch (error) {
    console.error('Error closing trade:', error);
    return ErrorHandlers.serverError('Failed to close trade');
  }
}
