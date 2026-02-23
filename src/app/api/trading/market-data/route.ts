import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ErrorHandlers, successResponse } from '@/lib/apiResponse';
import { requireOneOfRoles } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  try {
    const session = await requireOneOfRoles(request, ['TRADER', 'ADMIN']);
    if (!session) {
      return ErrorHandlers.unauthorized('Unauthorized');
    }

    const search = request.nextUrl.searchParams.get('search')?.trim();

    const marketData = await prisma.mockedMarketData.findMany({
      where: search
        ? {
            OR: [
              { scrip: { contains: search.toUpperCase(), mode: 'insensitive' } },
              { scripFullName: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { scrip: 'asc' },
      take: 100,
    });

    return successResponse({ marketData });
  } catch (error) {
    console.error('Error fetching market data:', error);
    return ErrorHandlers.serverError('Failed to fetch market data');
  }
}
