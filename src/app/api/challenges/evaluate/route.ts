import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { evaluateChallenge, getEvaluationSummary } from '@/lib/evaluateChallenge';
import { requireOneOfRoles, AuthenticatedSession } from '@/lib/apiAuth';

interface EvaluateRequestBody {
  challengeId?: string;
  userId?: string;
}

interface LoadedChallenge {
  id: string;
  userId: string;
  status: 'PENDING' | 'ACTIVE' | 'PASSED' | 'FAILED';
  startDate: Date | null;
  endDate: Date | null;
  currentPnl: number;
  maxDrawdown: number | null;
  violationCount: number;
  plan: {
    id: string;
    name: string;
    description: string | null;
    accountSize: number;
    profitTargetPct: number;
    maxLossPct: number;
    dailyLossPct: number;
    fee: number;
    durationDays: number;
    allowedInstruments: string[];
    profitSplit: number;
    level: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  metrics: Array<{
    id: string;
    challengeId: string;
    date: Date;
    dailyPnl: number;
    cumulativePnl: number;
    tradesCount: number;
    winRate: number;
    maxDrawdown: number;
    profitTarget: number;
    violations: number;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

class EvaluateApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function parsePayload(body: EvaluateRequestBody) {
  return {
    challengeId: body.challengeId?.trim(),
    userId: body.userId?.trim(),
  };
}

async function loadSingleChallenge(challengeId: string): Promise<LoadedChallenge | null> {
  return prisma.userChallenge.findUnique({
    where: { id: challengeId },
    include: {
      plan: true,
      metrics: {
        orderBy: { date: 'asc' },
      },
    },
  }) as Promise<LoadedChallenge | null>;
}

async function loadChallengesForRequest(
  session: AuthenticatedSession,
  { challengeId, userId }: { challengeId?: string; userId?: string },
): Promise<LoadedChallenge[]> {
  if (session.role === 'TRADER') {
    if (userId && userId !== session.userId) {
      throw new EvaluateApiError(403, 'Forbidden');
    }

    if (challengeId) {
      const challenge = await loadSingleChallenge(challengeId);
      if (!challenge) {
        throw new EvaluateApiError(404, 'Challenge not found.');
      }

      if (challenge.userId !== session.userId) {
        throw new EvaluateApiError(403, 'Forbidden');
      }

      return [challenge];
    }

    return (await prisma.userChallenge.findMany({
      where: {
        userId: session.userId,
        status: 'ACTIVE',
      },
      include: {
        plan: true,
        metrics: {
          orderBy: { date: 'asc' },
        },
      },
    })) as LoadedChallenge[];
  }

  if (challengeId) {
    const challenge = await loadSingleChallenge(challengeId);
    if (!challenge) {
      throw new EvaluateApiError(404, 'Challenge not found.');
    }

    return [challenge];
  }

  if (userId) {
    return (await prisma.userChallenge.findMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      include: {
        plan: true,
        metrics: {
          orderBy: { date: 'asc' },
        },
      },
    })) as LoadedChallenge[];
  }

  return (await prisma.userChallenge.findMany({
    where: {
      status: 'ACTIVE',
    },
    include: {
      plan: true,
      metrics: {
        orderBy: { date: 'asc' },
      },
    },
  })) as LoadedChallenge[];
}

/**
 * POST /api/challenges/evaluate
 * Evaluates all active challenges scoped to the authenticated user/session.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireOneOfRoles(request, ['TRADER', 'ADMIN']);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: EvaluateRequestBody = {};
    try {
      body = (await request.json()) as EvaluateRequestBody;
    } catch {
      body = {};
    }

    const { challengeId, userId } = parsePayload(body);
    const challenges = await loadChallengesForRequest(session, { challengeId, userId });

    if (challenges.length === 0) {
      return NextResponse.json({
        message: 'No active challenges found to evaluate.',
        evaluations: [],
      });
    }

    const evaluations = [];

    for (const challenge of challenges) {
      const result = evaluateChallenge({
        id: challenge.id,
        status: challenge.status,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        currentPnl: challenge.currentPnl ?? 0,
        maxDrawdown: challenge.maxDrawdown ?? 0,
        violationCount: challenge.violationCount,
        plan: challenge.plan,
        metrics: challenge.metrics,
      });

      if (result.status !== challenge.status) {
        const updateData: {
          status: 'ACTIVE' | 'PASSED' | 'FAILED' | 'PENDING';
          currentPnl: number;
          endDate?: Date;
          violationCount?: number;
          violationDetails?: string;
        } = {
          status: result.status,
          currentPnl:
            result.progressPct > 0
              ? challenge.metrics[challenge.metrics.length - 1]?.cumulativePnl ?? 0
              : 0,
        };

        if (result.passed || result.failed) {
          updateData.endDate = new Date();
        }

        if (result.violations.length > 0) {
          updateData.violationCount = result.violations.length;
          updateData.violationDetails = JSON.stringify(
            result.violations.map((violation) => ({
              type: violation.type,
              date: violation.date,
              description: violation.description,
              severity: violation.severity,
            })),
          );
        }

        await prisma.userChallenge.update({
          where: { id: challenge.id },
          data: updateData,
        });
      }

      evaluations.push({
        challengeId: challenge.id,
        userId: challenge.userId,
        planName: challenge.plan.name,
        previousStatus: challenge.status,
        newStatus: result.status,
        statusChanged: result.status !== challenge.status,
        passed: result.passed,
        failed: result.failed,
        reason: result.reason,
        summary: getEvaluationSummary(result),
        violations: result.violations,
        profitTargetAchieved: result.profitTargetAchieved,
        progressPct: result.progressPct,
        eligibleForNextLevel: result.eligibleForNextLevel,
      });
    }

    const passedCount = evaluations.filter((evaluation) => evaluation.passed).length;
    const failedCount = evaluations.filter((evaluation) => evaluation.failed).length;
    const activeCount = evaluations.filter((evaluation) => !evaluation.passed && !evaluation.failed)
      .length;

    return NextResponse.json({
      message: `Evaluated ${challenges.length} challenge(s)`,
      summary: {
        total: challenges.length,
        passed: passedCount,
        failed: failedCount,
        stillActive: activeCount,
      },
      evaluations,
    });
  } catch (error) {
    if (error instanceof EvaluateApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Challenge evaluation error:', error);
    return NextResponse.json(
      { error: 'Unable to evaluate challenges.' },
      { status: 500 },
    );
  }
}

/**
 * GET /api/challenges/evaluate
 * Returns evaluation summary without making changes.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireOneOfRoles(request, ['TRADER', 'ADMIN']);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const challengeId = request.nextUrl.searchParams.get('challengeId')?.trim() || undefined;
    const userId = request.nextUrl.searchParams.get('userId')?.trim() || undefined;

    const challenges = await loadChallengesForRequest(session, { challengeId, userId });

    const evaluations = challenges.map((challenge) => {
      const result = evaluateChallenge({
        id: challenge.id,
        status: challenge.status,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        currentPnl: challenge.currentPnl ?? 0,
        maxDrawdown: challenge.maxDrawdown ?? 0,
        violationCount: challenge.violationCount,
        plan: challenge.plan,
        metrics: challenge.metrics,
      });

      return {
        challengeId: challenge.id,
        userId: challenge.userId,
        planName: challenge.plan.name,
        currentStatus: challenge.status,
        recommendedStatus: result.status,
        passed: result.passed,
        failed: result.failed,
        reason: result.reason,
        summary: getEvaluationSummary(result),
        violations: result.violations,
        profitTargetAchieved: result.profitTargetAchieved,
        progressPct: result.progressPct,
        eligibleForNextLevel: result.eligibleForNextLevel,
      };
    });

    return NextResponse.json({
      message: `Evaluated ${challenges.length} challenge(s) (preview only)`,
      evaluations,
    });
  } catch (error) {
    if (error instanceof EvaluateApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Challenge evaluation preview error:', error);
    return NextResponse.json(
      { error: 'Unable to preview evaluations.' },
      { status: 500 },
    );
  }
}
