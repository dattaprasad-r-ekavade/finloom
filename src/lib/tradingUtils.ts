import { Trade, TradeStatus, TradeType } from '@prisma/client';

const IST_OFFSET_MINUTES = 330;

export const MARKET_OPEN_HOUR = 9;
export const MARKET_OPEN_MINUTE = 15;
export const MARKET_CLOSE_HOUR = 15;
export const MARKET_CLOSE_MINUTE = 30;

/**
 * Returns a new Date instance converted to IST.
 */
export function toIST(date: Date = new Date()): Date {
  return new Date(date.getTime() + IST_OFFSET_MINUTES * 60 * 1000);
}

/**
 * Returns a UTC Date representing the start of the day (00:00) in IST.
 */
export function getISTStartOfDay(date: Date = new Date()): Date {
  const istDate = toIST(date);
  istDate.setHours(0, 0, 0, 0);
  return new Date(istDate.getTime() - IST_OFFSET_MINUTES * 60 * 1000);
}

/**
 * Returns current IST time.
 */
export function nowIST(): Date {
  return toIST();
}

/**
 * Checks if market is considered open based on IST market hours.
 */
export function isMarketOpen(date: Date = new Date()): boolean {
  const ist = toIST(date);
  const day = ist.getDay();
  // Market closed on Saturday (6) and Sunday (0)
  if (day === 0 || day === 6) {
    return false;
  }

  const hours = ist.getHours();
  const minutes = ist.getMinutes();

  const isAfterOpen =
    hours > MARKET_OPEN_HOUR ||
    (hours === MARKET_OPEN_HOUR && minutes >= MARKET_OPEN_MINUTE);
  const isBeforeClose =
    hours < MARKET_CLOSE_HOUR ||
    (hours === MARKET_CLOSE_HOUR && minutes < MARKET_CLOSE_MINUTE);

  return isAfterOpen && isBeforeClose;
}

export function calculateRequiredCapital(quantity: number, price: number): number {
  return quantity * price;
}

export function calculateUnrealizedPnl(trade: Trade, ltp: number): number {
  const direction = trade.tradeType === TradeType.BUY ? 1 : -1;
  const entry = trade.entryPrice;
  return direction * (ltp - entry) * trade.quantity;
}

export function calculateRealizedPnl(trade: Trade): number {
  if (trade.status !== TradeStatus.CLOSED || trade.exitPrice === null) {
    return 0;
  }
  const direction = trade.tradeType === TradeType.BUY ? 1 : -1;
  return direction * ((trade.exitPrice ?? 0) - trade.entryPrice) * trade.quantity;
}

export function getRandomFluctuatedPrice(
  basePrice: number,
  minPct = 0.005,
  maxPct = 0.02,
): number {
  const direction = Math.random() > 0.5 ? 1 : -1;
  const pct = minPct + Math.random() * (maxPct - minPct);
  const price = basePrice * (1 + direction * pct);
  return Math.max(0, Number(price.toFixed(2)));
}

export function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return 0;
  }
  return Math.floor(quantity);
}

export function normalizeScripSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}
