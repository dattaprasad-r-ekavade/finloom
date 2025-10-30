import { NextResponse } from 'next/server';
import { ChallengeStatus } from '@prisma/client';

import { prisma } from '@/lib/prisma';

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
      return NextResponse.json(
        { error: 'User ID and plan ID are required.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { mockedKyc: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (!user.mockedKyc) {
      return NextResponse.json(
        { error: 'KYC must be completed before selecting a challenge plan.' },
        { status: 403 }
      );
    }

    const plan = await prisma.challengePlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { error: 'Challenge plan is unavailable.' },
        { status: 404 }
      );
    }

    const existingChallenge = await prisma.userChallenge.findFirst({
      where: {
        userId,
        status: { in: ACTIVE_STATUSES },
      },
      include: { plan: true },
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
            include: { plan: true },
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
        include: { plan: true },
      }));

    return NextResponse.json({
      message:
        existingChallenge && existingChallenge.planId === planId
          ? 'Challenge plan already selected.'
          : 'Challenge plan secured. Continue to payment.',
      selection: challengeRecord,
    });
  } catch (error) {
    console.error('Challenge selection error', error);
    return NextResponse.json(
      { error: 'Unable to reserve challenge plan. Please try again later.' },
      { status: 500 }
    );
  }
}
