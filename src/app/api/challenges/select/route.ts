import { NextResponse } from 'next/server';
import { ChallengeStatus } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { ErrorHandlers } from '@/lib/apiResponse';

interface SelectChallengeRequest {
  userId?: string;
  planId?: string;
}

const ACTIVE_STATUSES: ChallengeStatus[] = ['PENDING', 'ACTIVE'];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SelectChallengeRequest;
    const { userId, planId } = body;

    if (!userId || !planId) {
      return ErrorHandlers.badRequest('User ID and plan ID are required.');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { mockedKyc: true },
    });

    if (!user) {
      return ErrorHandlers.notFound('User not found.');
    }

    if (!user.mockedKyc) {
      return ErrorHandlers.forbidden('KYC must be completed before selecting a challenge plan.');
    }

    const plan = await prisma.challengePlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      return ErrorHandlers.notFound('Challenge plan is unavailable.');
    }

    const existingChallenge = await prisma.userChallenge.findFirst({
      where: {
        userId,
        status: { in: ACTIVE_STATUSES },
      },
      include: {
        plan: true,
        mockedPayments: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const updatedChallenge =
      existingChallenge && existingChallenge.planId !== planId
        ? await prisma.userChallenge.update({
            where: { id: existingChallenge.id },
            data: {
              planId,
              status: 'PENDING',
              startDate: null,
              endDate: null,
              demoAccountCredentials: null,
              currentPnl: 0,
              maxDrawdown: null,
              violationCount: 0,
              violationDetails: null,
            },
            include: {
              plan: true,
              mockedPayments: {
                orderBy: { createdAt: 'desc' },
              },
            },
          })
        : existingChallenge;

    const challengeRecord =
      updatedChallenge ??
      (await prisma.userChallenge.create({
        data: {
          userId,
          planId,
          status: 'PENDING',
        },
        include: {
          plan: true,
          mockedPayments: {
            orderBy: { createdAt: 'desc' },
          },
        },
      }));

    return NextResponse.json({
      message:
        existingChallenge && existingChallenge.planId === planId
          ? 'Challenge plan already selected.'
          : 'Challenge plan secured. Continue to payment.',
      selection: challengeRecord,
    });
  } catch (error) {
    console.error('Challenge selection error:', error);
    return ErrorHandlers.serverError(
      'Unable to reserve challenge plan. Please try again later.',
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}
