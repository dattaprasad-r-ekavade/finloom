import { NextResponse } from 'next/server';
import { ChallengeStatus } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { ErrorHandlers } from '@/lib/apiResponse';

const TRACKED_STATUSES: ChallengeStatus[] = ['PENDING', 'ACTIVE'];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return ErrorHandlers.badRequest('User ID is required.');
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
    console.error('Challenge selection fetch error:', error);
    return ErrorHandlers.serverError(
      'Unable to load challenge selection.',
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}
