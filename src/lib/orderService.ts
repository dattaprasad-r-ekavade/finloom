import { Prisma, TradeStatus, TradeType } from '@prisma/client';
import { prisma } from './prisma';
import { freshQuoteMap, quoteKey, QuoteUnavailable } from './tradeQuotes';
import { getISTStartOfDay, isEntryWindow } from './tradingUtils';

export class OrderRejected extends Error {
  constructor(message: string, public status = 409) { super(message); }
}

type Tx = Prisma.TransactionClient;
type Quotes = Awaited<ReturnType<typeof freshQuoteMap>>;

function valuedOpenTrades(trades: Array<{ scrip: string; exchange: string; quantity: number; entryPrice: number; tradeType: TradeType }>, quotes: Quotes) {
  let capitalUsed = 0;
  let unrealizedPnl = 0;
  for (const trade of trades) {
    const quote = quotes.get(quoteKey(trade));
    if (!quote || Date.now() - quote.asOf.getTime() > 90_000) {
      throw new QuoteUnavailable(`A recent price is unavailable for ${quoteKey(trade)}. Retry the order.`);
    }
    capitalUsed += trade.quantity * quote.ltp;
    unrealizedPnl += (trade.tradeType === TradeType.BUY ? 1 : -1) * (quote.ltp - trade.entryPrice) * trade.quantity;
  }
  return { capitalUsed, unrealizedPnl };
}

async function updateSummary(tx: Tx, challengeId: string, accountSize: number, quotes: Quotes) {
  const today = getISTStartOfDay();
  const tomorrow = new Date(today.getTime() + 86_400_000);
  const [open, closed, previousSummaries, tradesToday, closedToday] = await Promise.all([
    tx.trade.findMany({ where: { challengeId, status: 'OPEN' } }),
    tx.trade.findMany({ where: { challengeId, status: 'CLOSED' }, select: { pnl: true, exitTime: true } }),
    tx.dailyTradeSummary.findMany({ where: { challengeId, date: { lt: today } }, orderBy: { date: 'asc' } }),
    tx.trade.count({ where: { challengeId, entryTime: { gte: today, lt: tomorrow } } }),
    tx.trade.count({ where: { challengeId, status: 'CLOSED', exitTime: { gte: today, lt: tomorrow } } }),
  ]);
  const { capitalUsed, unrealizedPnl } = valuedOpenTrades(open, quotes);
  const realizedPnl = closed.reduce((sum, trade) => sum + trade.pnl, 0);
  const realizedToday = closed.filter((trade) => trade.exitTime && trade.exitTime >= today && trade.exitTime < tomorrow)
    .reduce((sum, trade) => sum + trade.pnl, 0);
  const previousEquityPnl = previousSummaries.reduce((sum, day) => sum + day.realizedPnl, 0)
    + (previousSummaries.at(-1)?.unrealizedPnl ?? 0);
  const currentEquityPnl = realizedPnl + unrealizedPnl;
  const dailyPnl = currentEquityPnl - previousEquityPnl;
  const capitalAvailable = Math.max(0, accountSize - capitalUsed - Math.max(0, -realizedPnl));
  const data = {
    totalTrades: tradesToday, openTrades: open.length, closedTrades: closedToday,
    realizedPnl: realizedToday, unrealizedPnl, capitalUsed, capitalAvailable,
    dayPnlPct: accountSize ? (dailyPnl / accountSize) * 100 : 0,
  };
  const summary = await tx.dailyTradeSummary.upsert({
    where: { challengeId_date: { challengeId, date: today } },
    create: { challengeId, date: today, ...data }, update: data,
  });
  await tx.userChallenge.update({ where: { id: challengeId }, data: { currentPnl: currentEquityPnl } });
  return { summary, portfolio: { capitalUsed, capitalAvailable, unrealizedPnl, realizedPnl } };
}

export async function placeOrder(input: {
  userId: string; challengeId: string; scrip: string; exchange: string;
  quantity: number; tradeType: TradeType; clientOrderId: string; entryReason?: string;
}) {
  const owned = await prisma.userChallenge.findFirst({ where: { id: input.challengeId, userId: input.userId }, select: { id: true } });
  if (!owned) throw new OrderRejected('Challenge not found.', 404);
  const prior = await prisma.trade.findUnique({ where: { challengeId_clientOrderId: {
    challengeId: input.challengeId, clientOrderId: input.clientOrderId,
  } } });
  if (prior) {
    if (prior.scrip !== input.scrip || prior.exchange !== input.exchange ||
        prior.quantity !== input.quantity || prior.tradeType !== input.tradeType) {
      throw new OrderRejected('clientOrderId was already used for a different order.');
    }
    return { trade: prior, replay: true };
  }
  if (!isEntryWindow()) throw new OrderRejected('Entry window is closed.', 409);
  const openBefore = await prisma.trade.findMany({ where: { challengeId: input.challengeId, status: 'OPEN' } });
  const quotes = await freshQuoteMap([...openBefore, input]);
  const entry = quotes.get(quoteKey(input));
  if (!entry) throw new QuoteUnavailable('A recent entry price is unavailable.');
  if (input.exchange !== 'NSE' || !entry.tradingSymbol.endsWith('-EQ')) {
    throw new OrderRejected('This preview only supports NSE equities.');
  }
  const today = getISTStartOfDay();
  const tomorrow = new Date(today.getTime() + 86_400_000);

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "UserChallenge" WHERE id = ${input.challengeId} AND "userId" = ${input.userId} FOR UPDATE`;
    const existing = await tx.trade.findUnique({ where: { challengeId_clientOrderId: { challengeId: input.challengeId, clientOrderId: input.clientOrderId } } });
    if (existing) {
      if (existing.scrip !== input.scrip || existing.exchange !== input.exchange ||
          existing.quantity !== input.quantity || existing.tradeType !== input.tradeType) {
        throw new OrderRejected('clientOrderId was already used for a different order.');
      }
      return { trade: existing, replay: true };
    }
    const challenge = await tx.userChallenge.findFirst({ where: { id: input.challengeId, userId: input.userId }, include: { plan: true } });
    if (!challenge || challenge.status !== 'ACTIVE') throw new OrderRejected('Challenge is not active.', 403);
    if (challenge.startDate && Date.now() >= challenge.startDate.getTime() + challenge.plan.durationDays * 86_400_000) {
      throw new OrderRejected('Challenge has expired.');
    }
    const allowedCategory = input.exchange === 'NSE' ? 'Equities' : null;
    if (!challenge.plan.allowedInstruments.includes(input.scrip) &&
        (!allowedCategory || !challenge.plan.allowedInstruments.includes(allowedCategory))) {
      throw new OrderRejected('Instrument is not allowed by this challenge.');
    }
    const [open, closed, count, previousSummaries] = await Promise.all([
      tx.trade.findMany({ where: { challengeId: input.challengeId, status: 'OPEN' } }),
      tx.trade.findMany({ where: { challengeId: input.challengeId, status: 'CLOSED' }, select: { pnl: true } }),
      tx.trade.count({ where: { challengeId: input.challengeId, entryTime: { gte: today, lt: tomorrow } } }),
      tx.dailyTradeSummary.findMany({ where: { challengeId: input.challengeId, date: { lt: today } }, orderBy: { date: 'asc' } }),
    ]);
    if (count >= 100) throw new OrderRejected('Daily trade limit reached.');
    const { capitalUsed, unrealizedPnl } = valuedOpenTrades(open, quotes);
    const realizedPnl = closed.reduce((sum, trade) => sum + trade.pnl, 0);
    const equityPnl = realizedPnl + unrealizedPnl;
    const previousEquityPnl = previousSummaries.reduce((sum, day) => sum + day.realizedPnl, 0)
      + (previousSummaries.at(-1)?.unrealizedPnl ?? 0);
    if (equityPnl <= -challenge.plan.accountSize * challenge.plan.maxLossPct / 100 ||
        equityPnl - previousEquityPnl <= -challenge.plan.accountSize * challenge.plan.dailyLossPct / 100) {
      throw new OrderRejected('Loss limit reached.');
    }
    if (capitalUsed + input.quantity * entry.ltp > challenge.plan.accountSize - Math.max(0, -realizedPnl)) {
      throw new OrderRejected('Insufficient available capital.');
    }
    const trade = await tx.trade.create({ data: {
      challengeId: input.challengeId, clientOrderId: input.clientOrderId,
      scrip: input.scrip, scripFullName: entry.scripFullName, exchange: input.exchange,
      quantity: input.quantity, entryPrice: entry.ltp, entryPriceAsOf: entry.asOf,
      entryReason: input.entryReason,
      tradeType: input.tradeType, status: TradeStatus.OPEN,
    } });
    return { trade, replay: false, ...(await updateSummary(tx, input.challengeId, challenge.plan.accountSize, quotes)) };
  }, { timeout: 10_000 });
}

export async function closePosition(tradeId: string, userId: string, autoSquaredOff = false) {
  const initial = await prisma.trade.findUnique({ where: { id: tradeId }, include: { challenge: { include: { plan: true } } } });
  if (!initial || initial.challenge.userId !== userId) throw new OrderRejected('Trade not found.', 404);
  if (initial.status === 'CLOSED') return { trade: initial, replay: true };
  const openBefore = await prisma.trade.findMany({ where: { challengeId: initial.challengeId, status: 'OPEN' } });
  const quotes = await freshQuoteMap(openBefore);
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "UserChallenge" WHERE id = ${initial.challengeId} FOR UPDATE`;
    const trade = await tx.trade.findUniqueOrThrow({ where: { id: tradeId } });
    if (trade.status === 'CLOSED') return { trade, replay: true };
    const quote = quotes.get(quoteKey(trade));
    if (!quote || Date.now() - quote.asOf.getTime() > 90_000) throw new QuoteUnavailable('A recent exit price is unavailable.');
    const pnl = (trade.tradeType === TradeType.BUY ? 1 : -1) * (quote.ltp - trade.entryPrice) * trade.quantity;
    const changed = await tx.trade.updateMany({ where: { id: tradeId, status: 'OPEN' }, data: {
      status: 'CLOSED', exitPrice: quote.ltp, exitPriceAsOf: quote.asOf,
      exitTime: new Date(), pnl: Number(pnl.toFixed(2)), autoSquaredOff,
    } });
    if (changed.count !== 1) throw new OrderRejected('Trade was already closed.');
    const closed = await tx.trade.findUniqueOrThrow({ where: { id: tradeId } });
    return { trade: closed, replay: false, ...(await updateSummary(tx, trade.challengeId, initial.challenge.plan.accountSize, quotes)) };
  }, { timeout: 10_000 });
}
