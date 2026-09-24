import { NextRequest } from 'next/server';
import { ErrorHandlers, errorResponse, successResponse } from '@/lib/apiResponse';
import { requireTrader } from '@/app/api/trading/_helpers';
import { closePosition, OrderRejected } from '@/lib/orderService';
import { QuoteUnavailable } from '@/lib/tradeQuotes';

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return errorResponse('Customer trading is disabled in this preview.', 503);
  }
  const trader = await requireTrader(request);
  if (!trader) return ErrorHandlers.unauthorized('Trader authentication required');
  try {
    const body = await request.json();
    const tradeId = typeof body.tradeId === 'string' ? body.tradeId.trim() : '';
    if (!tradeId) return ErrorHandlers.validationError('tradeId is required');
    return successResponse(await closePosition(tradeId, trader.userId));
  } catch (error) {
    if (error instanceof OrderRejected) return errorResponse(error.message, error.status);
    if (error instanceof QuoteUnavailable) return errorResponse(error.message, 409);
    console.error('Error closing trade:', error);
    return ErrorHandlers.serverError('Failed to close trade');
  }
}
