import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ErrorHandlers, successResponse } from '@/lib/apiResponse';
import {
  calculateRequiredCapital,
  calculateUnrealizedPnl,
  getISTStartOfDay,
} from '@/lib/tradingUtils';
import { requireAdmin } from '@/app/api/trading/_helpers';
import { TradeStatus, TradeType } from '@prisma/client';

interface AutoSquareOffBody {
  challengeId?: string;
}

function isCronAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return false;
  }
  return request.headers.get('x-cron-secret') === cronSecret;
}

export async function POST(request: NextRequest) {
  try {
    const cronAuthorized = isCronAuthorized(request);
    const admin = cronAuthorized ? null : await requireAdmin(request);

    if (!cronAuthorized && !admin) {
      return ErrorHandlers.unauthorized('Unauthorized');
    }

    let body: AutoSquareOffBody = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const challengeFilter = body.challengeId?.trim();

    const openTrades = await prisma.trade.findMany({
      where: {
        status: TradeStatus.OPEN,
        ...(challengeFilter ? { challengeId: challengeFilter } : {}),
      },
      include: {
        challenge: {
          select: {
            id: true,
            plan: {
              select: {
                accountSize: true,
              },
            },
          },
        },
      },
    });

    if (!openTrades.length) {
      return successResponse(
        { closedTrades: [], summaries: [] },
        'No open trades found for auto square-off',
      );
    }

    const scrips = Array.from(new Set(openTrades.map((trade) => trade.scrip)));
    const marketSnapshots = await prisma.mockedMarketData.findMany({
      where: {
        scrip: { in: scrips },
      },
    });

    const priceMap = new Map<string, number>();
    marketSnapshots.forEach((snapshot) =>
      priceMap.set(snapshot.scrip, snapshot.ltp),
    );

    const now = new Date();
    const closeOperations = openTrades.map((trade) => {
      const ltp = priceMap.get(trade.scrip) ?? trade.entryPrice;
      const direction = trade.tradeType === TradeType.BUY ? 1 : -1;
      const pnl = direction * (ltp - trade.entryPrice) * trade.quantity;

      return prisma.trade.update({
        where: { id: trade.id },
        data: {
          status: TradeStatus.CLOSED,
          exitPrice: ltp,
          exitTime: now,
          pnl: Number(pnl.toFixed(2)),
          autoSquaredOff: true,
        },
      });
    });

    const closedTrades = await prisma.$transaction(closeOperations);
    const challengeIds = Array.from(
      new Set(openTrades.map((trade) => trade.challengeId)),
    );

    const todayStart = getISTStartOfDay();
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const summaries = [];
    for (const challengeId of challengeIds) {
      const challengeRecord = await prisma.userChallenge.findUnique({
        where: { id: challengeId },
        include: {
          plan: true,
        },
      });

      if (!challengeRecord) {
        continue;
      }

      const [openTradesRemaining, aggregateRealized, closedTradesTodayCount, realizedToday, tradesTodayCount] =
        await Promise.all([
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
          prisma.trade.count({
            where: {
              challengeId,
              status: TradeStatus.CLOSED,
              exitTime: {
                gte: todayStart,
                lt: tomorrowStart,
              },
            },
          }),
          prisma.trade.aggregate({
            where: {
              challengeId,
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
          prisma.trade.count({
            where: {
              challengeId,
              entryTime: {
                gte: todayStart,
                lt: tomorrowStart,
              },
            },
          }),
        ]);

      const remainingScrips = Array.from(
        new Set(openTradesRemaining.map((trade) => trade.scrip)),
      );
      const remainingSnapshots = remainingScrips.length
        ? await prisma.mockedMarketData.findMany({
            where: { scrip: { in: remainingScrips } },
          })
        : [];

      const remainingPriceMap = new Map<string, number>();
      remainingSnapshots.forEach((snapshot) =>
        remainingPriceMap.set(snapshot.scrip, snapshot.ltp),
      );

      const capitalUsed = openTradesRemaining.reduce((total, trade) => {
        const ltp = remainingPriceMap.get(trade.scrip) ?? trade.entryPrice;
        return total + calculateRequiredCapital(trade.quantity, ltp);
      }, 0);

      const unrealizedPnl = openTradesRemaining.reduce((total, trade) => {
        const ltp = remainingPriceMap.get(trade.scrip) ?? trade.entryPrice;
        return total + calculateUnrealizedPnl(trade, ltp);
      }, 0);

      const realizedSum = aggregateRealized._sum.pnl ?? 0;
      const realizedLoss = realizedSum < 0 ? Math.abs(realizedSum) : 0;
      const capitalAvailable =
        challengeRecord.plan.accountSize - capitalUsed - realizedLoss;
      const realizedPnlToday = realizedToday._sum.pnl ?? 0;
      const dayPnlPct =
        ((realizedPnlToday + unrealizedPnl) / challengeRecord.plan.accountSize) *
        100;

      const summary = await prisma.dailyTradeSummary.upsert({
        where: {
          challengeId_date: {
            challengeId,
            date: todayStart,
          },
        },
        create: {
          challengeId,
          date: todayStart,
          totalTrades: tradesTodayCount,
          openTrades: openTradesRemaining.length,
          closedTrades: closedTradesTodayCount,
          realizedPnl: realizedPnlToday,
          unrealizedPnl,
          capitalUsed,
          capitalAvailable: Math.max(0, capitalAvailable),
          dayPnlPct: Number(dayPnlPct.toFixed(4)),
        },
        update: {
          totalTrades: tradesTodayCount,
          openTrades: openTradesRemaining.length,
          closedTrades: closedTradesTodayCount,
          realizedPnl: realizedPnlToday,
          unrealizedPnl,
          capitalUsed,
          capitalAvailable: Math.max(0, capitalAvailable),
          dayPnlPct: Number(dayPnlPct.toFixed(4)),
        },
      });

      await prisma.userChallenge.update({
        where: { id: challengeId },
        data: {
          currentPnl: realizedSum + unrealizedPnl,
        },
      });

      summaries.push(summary);
    }

    return successResponse({
      closedTrades,
      summaries,
    });
  } catch (error) {
    console.error('Error auto square-off:', error);
    return ErrorHandlers.serverError('Failed to auto square-off trades');
  }
}
