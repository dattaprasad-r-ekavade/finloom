import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const plans = await prisma.challengePlan.findMany({
      where: { isActive: true },
      orderBy: { level: 'asc' },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Challenge plans fetch error', error);
    return NextResponse.json(
      { error: 'Unable to load challenge plans right now.' },
      { status: 500 }
    );
  }
}
