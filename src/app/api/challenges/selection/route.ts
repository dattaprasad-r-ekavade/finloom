import { NextResponse } from 'next/server';
import { ChallengeStatus } from '@prisma/client';

import { prisma } from '@/lib/prisma';

const TRACKED_STATUSES: ChallengeStatus[] = ['PENDING', 'ACTIVE'];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required.' },
        { status: 400 }
      );
    }

    const selection = await prisma.userChallenge.findFirst({
      where: {
        userId,
        status: { in: TRACKED_STATUSES },
      },
      include: {
        plan: true,
        mockedPayments: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      selection,
    });
  } catch (error) {
    console.error('Challenge selection fetch error', error);
    return NextResponse.json(
      { error: 'Unable to load challenge selection.' },
      { status: 500 }
    );
  }
}
