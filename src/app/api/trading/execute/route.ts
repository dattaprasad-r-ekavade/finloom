import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ErrorHandlers, successResponse } from '@/lib/apiResponse';
import {
  calculateRequiredCapital,
  calculateUnrealizedPnl,
  clampQuantity,
  getISTStartOfDay,
  normalizeScripSymbol,
} from '@/lib/tradingUtils';
import { requireTrader, getChallengeForTrader } from '@/app/api/trading/_helpers';
import { TradeStatus, TradeType } from '@prisma/client';

interface ExecuteBody {
  challengeId?: string;
  scrip?: string;
  quantity?: number;
  tradeType?: TradeType;
}

export async function POST(request: NextRequest) {
  try {
    const trader = await requireTrader(request);

    if (!trader) {
      return ErrorHandlers.unauthorized('Trader authentication required');
    }

    const body = (await request.json()) as ExecuteBody;

    const challengeId = body.challengeId?.trim();
    const scrip = body.scrip ? normalizeScripSymbol(body.scrip) : '';
    const quantity = clampQuantity(Number(body.quantity));
    const tradeType = body.tradeType;

    if (!challengeId || !scrip || !tradeType || quantity <= 0) {
      return ErrorHandlers.validationError('Invalid request payload', {
        challengeId,
        scrip,
        quantity,
        tradeType,
      });
    }

    if (tradeType !== TradeType.BUY && tradeType !== TradeType.SELL) {
      return ErrorHandlers.validationError('tradeType must be BUY or SELL');
    }

    const challenge = await getChallengeForTrader(challengeId, trader.userId);

    if (!challenge) {
      return ErrorHandlers.notFound('Challenge not found');
    }

    if (challenge.status !== 'ACTIVE') {
      return ErrorHandlers.forbidden('Challenge is not active');
    }

    const marketData = await prisma.mockedMarketData.findUnique({
      where: { scrip },
    });

    if (!marketData) {
      return ErrorHandlers.notFound('Requested scrip is unavailable');
    }

    const todayStart = getISTStartOfDay();
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const tradesTodayCountPromise = prisma.trade.count({
      where: {
        challengeId,
        entryTime: {
          gte: todayStart,
          lt: tomorrowStart,
        },
      },
    });

    const openTradesPromise = prisma.trade.findMany({
      where: {
        challengeId,
        status: TradeStatus.OPEN,
      },
    });

    const aggregateRealizedPromise = prisma.trade.aggregate({
      where: {
        challengeId,
        status: TradeStatus.CLOSED,
      },
      _sum: {
        pnl: true,
      },
    });

    const [tradesTodayCount, openTrades, aggregateRealized] = await Promise.all([
      tradesTodayCountPromise,
      openTradesPromise,
      aggregateRealizedPromise,
    ]);

    if (tradesTodayCount >= 100) {
      return ErrorHandlers.forbidden('Daily trade limit of 100 reached');
    }

    const scripsToFetch = Array.from(
      new Set([...openTrades.map((trade) => trade.scrip), scrip]),
    );
    const otherMarketData = await prisma.mockedMarketData.findMany({
      where: {
        scrip: { in: scripsToFetch },
      },
    });

    const priceMap = new Map<string, number>();
    otherMarketData.forEach((item) => priceMap.set(item.scrip, item.ltp));
    priceMap.set(scrip, marketData.ltp);

    const capitalUsedBefore = openTrades.reduce((total, trade) => {
      const ltp = priceMap.get(trade.scrip) ?? trade.entryPrice;
      return total + calculateRequiredCapital(trade.quantity, ltp);
    }, 0);

    const requiredCapital = calculateRequiredCapital(quantity, marketData.ltp);
    const realizedSum = aggregateRealized._sum.pnl ?? 0;
    const realizedLoss = realizedSum < 0 ? Math.abs(realizedSum) : 0;
    const capitalAvailableBefore =
      challenge.plan.accountSize - capitalUsedBefore - realizedLoss;

    if (capitalAvailableBefore < requiredCapital) {
      return ErrorHandlers.forbidden(
        'Insufficient available capital to place this trade',
      );
    }

    const createdTrade = await prisma.trade.create({
      data: {
        challengeId,
        scrip: marketData.scrip,
        scripFullName: marketData.scripFullName,
        quantity,
        entryPrice: marketData.ltp,
        tradeType,
        status: TradeStatus.OPEN,
        pnl: 0,
      },
    });

    const openTradesAfter = [...openTrades, createdTrade];
    const capitalUsedAfter = openTradesAfter.reduce((total, trade) => {
      const ltp = priceMap.get(trade.scrip) ?? trade.entryPrice;
      return total + calculateRequiredCapital(trade.quantity, ltp);
    }, 0);

    const capitalAvailableAfter =
      challenge.plan.accountSize - capitalUsedAfter - realizedLoss;

    const unrealizedPnlAfter = openTradesAfter.reduce((total, trade) => {
      const ltp = priceMap.get(trade.scrip) ?? trade.entryPrice;
      return total + calculateUnrealizedPnl(trade, ltp);
    }, 0);

    const closedTradesTodayCountPromise = prisma.trade.count({
      where: {
        challengeId,
        status: TradeStatus.CLOSED,
        exitTime: {
          gte: todayStart,
          lt: tomorrowStart,
        },
      },
    });

    const realizedTodayPromise = prisma.trade.aggregate({
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
    });

    const [closedTradesTodayCount, realizedToday] = await Promise.all([
      closedTradesTodayCountPromise,
      realizedTodayPromise,
    ]);

    const realizedPnlToday = realizedToday._sum.pnl ?? 0;
    const totalTradesToday = tradesTodayCount + 1;
    const dayPnlPct =
      ((realizedPnlToday + unrealizedPnlAfter) / challenge.plan.accountSize) *
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
        totalTrades: totalTradesToday,
        openTrades: openTradesAfter.length,
        closedTrades: closedTradesTodayCount,
        realizedPnl: realizedPnlToday,
        unrealizedPnl: unrealizedPnlAfter,
        capitalUsed: capitalUsedAfter,
        capitalAvailable: Math.max(0, capitalAvailableAfter),
        dayPnlPct: Number(dayPnlPct.toFixed(4)),
      },
      update: {
        totalTrades: totalTradesToday,
        openTrades: openTradesAfter.length,
        closedTrades: closedTradesTodayCount,
        realizedPnl: realizedPnlToday,
        unrealizedPnl: unrealizedPnlAfter,
        capitalUsed: capitalUsedAfter,
        capitalAvailable: Math.max(0, capitalAvailableAfter),
        dayPnlPct: Number(dayPnlPct.toFixed(4)),
      },
    });

    const combinedPnl = realizedSum + unrealizedPnlAfter;
    await prisma.userChallenge.update({
      where: { id: challengeId },
      data: {
        currentPnl: combinedPnl,
      },
    });

    return successResponse({
      trade: createdTrade,
      summary,
      portfolio: {
        capitalUsed: capitalUsedAfter,
        capitalAvailable: Math.max(0, capitalAvailableAfter),
        unrealizedPnl: unrealizedPnlAfter,
        realizedPnl: realizedSum,
      },
    });
  } catch (error) {
    console.error('Error executing trade:', error);
    return ErrorHandlers.serverError('Failed to execute trade');
  }
}
