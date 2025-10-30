import { NextResponse } from 'next/server';
import { ChallengeStatus } from '@prisma/client';

import { prisma } from '@/lib/prisma';

interface MockPaymentRequest {
  userId?: string;
}

type CredentialPair = {
  username: string;
  password: string;
};

const ELIGIBLE_CHALLENGE_STATUSES: ChallengeStatus[] = ['PENDING', 'ACTIVE'];

const generateTransactionId = () =>
  `razorpay_mock_${Math.random().toString(36).slice(2, 14)}`;

const generateCredentials = (): CredentialPair => ({
  username: `demo_trader_${Math.random().toString(36).slice(2, 8)}`,
  password: `Pass@${Math.random().toString(36).slice(2, 10)}`,
});

const parseStoredCredentials = (value: string | null): CredentialPair | null => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as CredentialPair;

    if (parsed.username && parsed.password) {
      return parsed;
    }
  } catch (error) {
    console.warn('Unable to parse stored demo credentials', error);
  }

  const [usernamePart, passwordPart] = value.split('|').map((part) => part.trim());

  if (usernamePart?.toLowerCase().startsWith('username') && passwordPart?.toLowerCase().startsWith('password')) {
    const username = usernamePart.split(':')[1]?.trim();
    const password = passwordPart.split(':')[1]?.trim();

    if (username && password) {
      return { username, password };
    }
  }

  return null;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MockPaymentRequest;
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { mockedKyc: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      );
    }

    if (!user.mockedKyc) {
      return NextResponse.json(
        { error: 'KYC must be approved before processing payment.' },
        { status: 403 }
      );
    }

    const challenge = await prisma.userChallenge.findFirst({
      where: {
        userId,
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
      const storedCredentials = parseStoredCredentials(challenge.demoAccountCredentials);

      return NextResponse.json({
        message: 'Mock payment already processed.',
        payment: existingPayment,
        challenge,
        credentials: storedCredentials,
      });
    }

    const credentials =
      parseStoredCredentials(challenge.demoAccountCredentials) ?? generateCredentials();

    const transactionId = generateTransactionId();

    const payment = existingPayment
      ? existingPayment
      : await prisma.mockedPayment.create({
          data: {
            userId,
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
        demoAccountCredentials: JSON.stringify(credentials),
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
