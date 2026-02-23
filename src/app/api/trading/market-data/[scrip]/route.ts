import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ErrorHandlers, successResponse } from '@/lib/apiResponse';
import { requireOneOfRoles } from '@/lib/apiAuth';

interface RouteParams {
  params: Promise<{
    scrip: string;
  }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireOneOfRoles(_request, ['TRADER', 'ADMIN']);
    if (!session) {
      return ErrorHandlers.unauthorized('Unauthorized');
    }

    const { scrip } = await params;
    const symbol = scrip?.trim();
    if (!symbol) {
      return ErrorHandlers.badRequest('Scrip symbol is required');
    }

    const marketData = await prisma.mockedMarketData.findUnique({
      where: { scrip: symbol.toUpperCase() },
    });

    if (!marketData) {
      return ErrorHandlers.notFound('Scrip not found');
    }

    return successResponse({ marketData });
  } catch (error) {
    console.error('Error fetching market data item:', error);
    return ErrorHandlers.serverError('Failed to fetch market data');
  }
}
