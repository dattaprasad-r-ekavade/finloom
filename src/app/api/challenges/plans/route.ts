import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { ErrorHandlers } from '@/lib/apiResponse';
import { requireRole } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, 'TRADER');
    if (!session) {
      return ErrorHandlers.unauthorized('Trader authentication required.');
    }

    const plans = await prisma.challengePlan.findMany({
      where: { isActive: true },
      orderBy: { level: 'asc' },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Challenge plans fetch error:', error);
    return ErrorHandlers.serverError(
      'Unable to load challenge plans right now.',
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}
