import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ErrorHandlers, successResponse } from '@/lib/apiResponse';
import {
  getRandomFluctuatedPrice,
  isMarketOpen,
  normalizeScripSymbol,
} from '@/lib/tradingUtils';
import { requireAdmin } from '@/app/api/trading/_helpers';

function isCronAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return false;
  }
  const headerSecret = request.headers.get('x-cron-secret');
  return Boolean(headerSecret && headerSecret === cronSecret);
}

export async function POST(request: NextRequest) {
  try {
    const cronAuthorized = isCronAuthorized(request);
    const admin = cronAuthorized ? null : await requireAdmin(request);

    if (!cronAuthorized && !admin) {
      return ErrorHandlers.unauthorized('Unauthorized');
    }

    if (!isMarketOpen()) {
      return successResponse(
        { updated: [] },
        'Market is closed. Prices remain unchanged.',
      );
    }

    let body: { scrips?: string[] } = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const symbols = Array.isArray(body.scrips)
      ? body.scrips
          .map((symbol) => normalizeScripSymbol(symbol))
          .filter((symbol) => symbol.length > 0)
      : null;

    const marketData = await prisma.mockedMarketData.findMany({
      where: symbols ? { scrip: { in: symbols } } : undefined,
    });

    if (marketData.length === 0) {
      return successResponse(
        { updated: [] },
        symbols ? 'No matching scrips found' : 'No market data available',
      );
    }

    const now = new Date();
    const updates = marketData.map((item) => {
      const newLtp = getRandomFluctuatedPrice(item.ltp);
      const volumeDrift = Math.round(item.volume * (Math.random() * 0.04 - 0.02));
      return prisma.mockedMarketData.update({
        where: { id: item.id },
        data: {
          ltp: newLtp,
          high: Math.max(item.high, newLtp),
          low: Math.min(item.low, newLtp),
          close: newLtp,
          volume: Math.max(0, item.volume + volumeDrift),
          lastUpdated: now,
        },
      });
    });

    const updatedRecords = await prisma.$transaction(updates);

    return successResponse({ updated: updatedRecords });
  } catch (error) {
    console.error('Error updating market data:', error);
    return ErrorHandlers.serverError('Failed to update market data');
  }
}
