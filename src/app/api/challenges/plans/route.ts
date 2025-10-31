import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { ErrorHandlers } from '@/lib/apiResponse';

export async function GET() {
  try {
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
