import { NextRequest } from 'next/server';
import { TradeType } from '@prisma/client';
import { ErrorHandlers, errorResponse, successResponse } from '@/lib/apiResponse';
import { requireTrader } from '@/app/api/trading/_helpers';
import { placeOrder, OrderRejected } from '@/lib/orderService';
import { QuoteUnavailable } from '@/lib/tradeQuotes';
import { clampQuantity, normalizeScripSymbol } from '@/lib/tradingUtils';

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return errorResponse('Customer trading is disabled in this preview.', 503);
  }
  const trader = await requireTrader(request);
  if (!trader) return ErrorHandlers.unauthorized('Trader authentication required');
  try {
    const body = await request.json();
    const challengeId = typeof body.challengeId === 'string' ? body.challengeId.trim() : '';
    const scrip = typeof body.scrip === 'string' ? normalizeScripSymbol(body.scrip) : '';
    const exchange = typeof body.exchange === 'string' ? body.exchange.trim().toUpperCase() : 'NSE';
    const quantity = clampQuantity(Number(body.quantity));
    const tradeType = body.tradeType as TradeType;
    const clientOrderId = typeof body.clientOrderId === 'string' ? body.clientOrderId.trim() : '';
    const entryReason = typeof body.entryReason === 'string' ? body.entryReason.trim() : '';
    if (!challengeId || !scrip || !exchange || quantity <= 0 ||
        ![TradeType.BUY, TradeType.SELL].includes(tradeType) ||
        !/^[0-9a-f-]{36}$/i.test(clientOrderId)) {
      return ErrorHandlers.validationError('Valid challenge, instrument, quantity, side and clientOrderId are required.');
    }
    if (entryReason.length > 500) return ErrorHandlers.validationError('Trade reason must be 500 characters or fewer.');
    return successResponse(await placeOrder({ userId: trader.userId, challengeId, scrip, exchange, quantity, tradeType, clientOrderId, entryReason }));
  } catch (error) {
    if (error instanceof OrderRejected) return errorResponse(error.message, error.status);
    if (error instanceof QuoteUnavailable) return errorResponse(error.message, 409);
    console.error('Error executing trade:', error);
    return ErrorHandlers.serverError('Failed to execute trade');
  }
}
