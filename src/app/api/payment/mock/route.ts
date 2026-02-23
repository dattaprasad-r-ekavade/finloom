import { NextRequest, NextResponse } from 'next/server';
import { ChallengeStatus } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import {
  parseChallengeCredentials,
  serialiseChallengeCredentials,
  ChallengeCredentials,
} from '@/lib/challengeCredentials';
import { requireRole } from '@/lib/apiAuth';

const ELIGIBLE_CHALLENGE_STATUSES: ChallengeStatus[] = ['PENDING', 'ACTIVE'];

const generateTransactionId = () =>
  `razorpay_mock_${Math.random().toString(36).slice(2, 14)}`;

const generateCredentials = (): ChallengeCredentials => ({
  username: `demo_trader_${Math.random().toString(36).slice(2, 8)}`,
  password: `Pass@${Math.random().toString(36).slice(2, 10)}`,
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(request, 'TRADER');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { mockedKyc: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      );
    }

    if (!user.mockedKyc || !['APPROVED', 'AUTO_APPROVED'].includes(user.mockedKyc.status)) {
      return NextResponse.json(
        { error: 'KYC must be approved before processing payment.' },
        { status: 403 }
      );
    }

    const challenge = await prisma.userChallenge.findFirst({
      where: {
        userId: session.userId,
        status: { in: ELIGIBLE_CHALLENGE_STATUSES },
      },
      include: {
        plan: true,
        mockedPayments: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: 'No challenge reservation found for this user.' },
        { status: 404 }
      );
    }

    const { plan } = challenge;

    if (!plan) {
      return NextResponse.json(
        { error: 'Associated challenge plan not found.' },
        { status: 404 }
      );
    }

    const existingPayment = challenge.mockedPayments[0] ?? null;

    if (existingPayment && challenge.status === 'ACTIVE') {
      const storedCredentials = parseChallengeCredentials(challenge.demoAccountCredentials);

      return NextResponse.json({
        message: 'Mock payment already processed.',
        payment: existingPayment,
        challenge,
        credentials: storedCredentials,
      });
    }

    const credentials =
      parseChallengeCredentials(challenge.demoAccountCredentials) ?? generateCredentials();

    const transactionId = generateTransactionId();

    const payment = existingPayment
      ? existingPayment
      : await prisma.mockedPayment.create({
          data: {
            userId: session.userId,
            challengeId: challenge.id,
            amount: plan.fee,
            mockTransactionId: transactionId,
            status: 'SUCCESS',
          },
        });

    const updatedChallenge = await prisma.userChallenge.update({
      where: { id: challenge.id },
      data: {
        status: 'ACTIVE',
        startDate: challenge.startDate ?? new Date(),
        demoAccountCredentials: serialiseChallengeCredentials(credentials),
      },
      include: {
        plan: true,
        mockedPayments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json({
      message: existingPayment
        ? 'Challenge already active. Mock payment reaffirmed.'
        : 'Mock payment confirmed. Challenge activated.',
      payment,
      challenge: updatedChallenge,
      credentials,
    });
  } catch (error) {
    console.error('Mock payment processing error', error);
    return NextResponse.json(
      { error: 'Unable to process mock payment. Please try again later.' },
      { status: 500 }
    );
  }
}
