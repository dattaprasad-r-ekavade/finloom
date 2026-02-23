import { NextRequest, NextResponse } from 'next/server';
import { ChallengeStatus } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import {
  ChallengeCredentials,
  parseChallengeCredentials,
} from '@/lib/challengeCredentials';
import { requireOneOfRoles } from '@/lib/apiAuth';

interface ChallengeStatusSummary {
  cumulativePnl: number;
  profitTarget: number;
  progressPct: number;
  daysElapsed: number;
  daysRemaining: number;
  maxDrawdown: number;
  winRate: number;
  tradesCount: number;
}

interface ChallengeStatusResponse {
  challenge: {
    id: string;
    status: ChallengeStatus;
    startDate: Date | null;
    endDate: Date | null;
  };
  plan: {
    id: string;
    name: string;
    level: number;
    accountSize: number;
    profitTargetPct: number;
    maxLossPct: number;
    dailyLossPct: number;
    durationDays: number;
    profitSplit: number;
  };
  payments: {
    id: string;
    mockTransactionId: string;
    amount: number;
    paidAt: Date;
  }[];
  metrics: {
    id: string;
    date: Date;
    dailyPnl: number;
    cumulativePnl: number;
    tradesCount: number;
    winRate: number;
    maxDrawdown: number;
    profitTarget: number;
    violations: number;
  }[];
  summary: ChallengeStatusSummary;
  credentials: ChallengeCredentials | null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requireOneOfRoles(request, ['TRADER', 'ADMIN']);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = await context.params;
  const challengeId = params.id;

  if (!challengeId) {
    return NextResponse.json(
      { error: 'Challenge ID is required.' },
      { status: 400 }
    );
  }

  try {
    const challenge = await prisma.userChallenge.findUnique({
      where: { id: challengeId },
      include: {
        plan: true,
        mockedPayments: {
          orderBy: { createdAt: 'desc' },
        },
        metrics: {
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found.' },
        { status: 404 }
      );
    }

    if (session.role === 'TRADER' && challenge.userId !== session.userId) {
      return NextResponse.json(
        { error: 'You are not authorized to view this challenge.' },
        { status: 403 }
      );
    }

    if (!challenge.plan) {
      return NextResponse.json(
        { error: 'Challenge plan missing from record.' },
        { status: 500 }
      );
    }

    const metrics = challenge.metrics;

    const latestMetric = metrics[metrics.length - 1];
    const profitTarget = latestMetric?.profitTarget ?? 0;
    const cumulativePnl = latestMetric?.cumulativePnl ?? 0;
    const progressPct = profitTarget
      ? Math.min(100, (cumulativePnl / profitTarget) * 100)
      : 0;

    const maxDrawdown = metrics.reduce(
      (accumulator: number, metric: typeof metrics[0]) => Math.max(accumulator, metric.maxDrawdown),
      0
    );

    const tradesCount = metrics.reduce(
      (accumulator: number, metric: typeof metrics[0]) => accumulator + metric.tradesCount,
      0
    );

    const winRate = latestMetric?.winRate ?? 0;

    const daysElapsed = metrics.length;
    const daysRemaining = Math.max(
      challenge.plan.durationDays - daysElapsed,
      0
    );

    const summary: ChallengeStatusSummary = {
      cumulativePnl,
      profitTarget,
      progressPct: Number(progressPct.toFixed(2)),
      daysElapsed,
      daysRemaining,
      maxDrawdown,
      winRate,
      tradesCount,
    };

    const credentials = parseChallengeCredentials(
      challenge.demoAccountCredentials
    );

    const response: ChallengeStatusResponse = {
      challenge: {
        id: challenge.id,
        status: challenge.status,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
      },
      plan: {
        id: challenge.plan.id,
        name: challenge.plan.name,
        level: challenge.plan.level,
        accountSize: challenge.plan.accountSize,
        profitTargetPct: challenge.plan.profitTargetPct,
        maxLossPct: challenge.plan.maxLossPct,
        dailyLossPct: challenge.plan.dailyLossPct,
        durationDays: challenge.plan.durationDays,
        profitSplit: challenge.plan.profitSplit,
      },
      payments: challenge.mockedPayments.map((payment: typeof challenge.mockedPayments[0]) => ({
        id: payment.id,
        amount: payment.amount,
        mockTransactionId: payment.mockTransactionId,
        paidAt: payment.paidAt,
      })),
      metrics,
      summary,
      credentials,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Challenge status fetch error', error);
    return NextResponse.json(
      { error: 'Unable to load challenge status.' },
      { status: 500 }
    );
  }
}
