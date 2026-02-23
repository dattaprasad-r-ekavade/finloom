import { NextRequest, NextResponse } from 'next/server';
import { ChallengeStatus } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { ErrorHandlers } from '@/lib/apiResponse';
import { requireRole } from '@/lib/apiAuth';

interface SelectChallengeRequest {
  planId?: string;
}

const ACTIVE_STATUSES: ChallengeStatus[] = ['PENDING', 'ACTIVE'];

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(request, 'TRADER');
    if (!session) {
      return ErrorHandlers.unauthorized('Trader authentication required.');
    }

    const body = (await request.json()) as SelectChallengeRequest;
    const { planId } = body;

    if (!planId) {
      return ErrorHandlers.badRequest('Plan ID is required.');
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { mockedKyc: true },
    });

    if (!user) {
      return ErrorHandlers.notFound('User not found.');
    }

    if (!user.mockedKyc || !['APPROVED', 'AUTO_APPROVED'].includes(user.mockedKyc.status)) {
      return ErrorHandlers.forbidden('KYC must be approved before selecting a challenge plan.');
    }

    const plan = await prisma.challengePlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      return ErrorHandlers.notFound('Challenge plan is unavailable.');
    }

    const existingChallenge = await prisma.userChallenge.findFirst({
      where: {
        userId: session.userId,
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
          userId: session.userId,
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
