import { NextRequest } from 'next/server';
import { ErrorHandlers, successResponse } from '@/lib/apiResponse';
import { requireOneOfRoles } from '@/lib/apiAuth';
import { getLivePrice } from '@/lib/angeloneLivePrice';

interface RouteParams {
  params: Promise<{
    scrip: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireOneOfRoles(request, ['TRADER', 'ADMIN']);
    if (!session) {
      return ErrorHandlers.unauthorized('Unauthorized');
    }

    const { scrip } = await params;
    const symbol = scrip?.trim();
    if (!symbol) {
      return ErrorHandlers.badRequest('Scrip symbol is required');
    }

    const { searchParams } = new URL(request.url);
    const exchange = (searchParams.get('exchange') ?? 'NSE').toUpperCase();

    const liveData = await getLivePrice(symbol.toUpperCase(), exchange);

    if (!liveData) {
      return ErrorHandlers.notFound(`No live data found for ${symbol} on ${exchange}`);
    }

    return successResponse({ marketData: liveData });
  } catch (error) {
    console.error('Error fetching market data item:', error);
    return ErrorHandlers.serverError('Failed to fetch market data');
  }
}
