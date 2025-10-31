import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { evaluateChallenge, getEvaluationSummary } from '@/lib/evaluateChallenge';

/**
 * POST /api/challenges/evaluate
 * Evaluates all active challenges or a specific challenge by ID
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { challengeId, userId } = body;

    let challenges;

    if (challengeId) {
      // Evaluate specific challenge
      const challenge = await prisma.userChallenge.findUnique({
        where: { id: challengeId },
        include: {
          plan: true,
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

      challenges = [challenge];
    } else if (userId) {
      // Evaluate all active challenges for a user
      challenges = await prisma.userChallenge.findMany({
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
      });
    } else {
      // Evaluate all active challenges
      challenges = await prisma.userChallenge.findMany({
        where: {
          status: 'ACTIVE',
        },
        include: {
          plan: true,
          metrics: {
            orderBy: { date: 'asc' },
          },
        },
      });
    }

    if (challenges.length === 0) {
      return NextResponse.json({
        message: 'No active challenges found to evaluate.',
        evaluations: [],
      });
    }

    const evaluations = [];

    for (const challenge of challenges) {
      // Run evaluation
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

      // Update challenge if status changed
      if (result.status !== challenge.status) {
        const updateData: any = {
          status: result.status,
          currentPnl: result.progressPct > 0 ? challenge.metrics[challenge.metrics.length - 1]?.cumulativePnl ?? 0 : 0,
        };

        // Set end date if passed or failed
        if (result.passed || result.failed) {
          updateData.endDate = new Date();
        }

        // Update violation count and details
        if (result.violations.length > 0) {
          updateData.violationCount = result.violations.length;
          updateData.violationDetails = JSON.stringify(
            result.violations.map((v) => ({
              type: v.type,
              date: v.date,
              description: v.description,
              severity: v.severity,
            }))
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

    const passedCount = evaluations.filter((e) => e.passed).length;
    const failedCount = evaluations.filter((e) => e.failed).length;
    const activeCount = evaluations.filter(
      (e) => !e.passed && !e.failed
    ).length;

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
    console.error('Challenge evaluation error:', error);
    return NextResponse.json(
      { error: 'Unable to evaluate challenges.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/challenges/evaluate
 * Returns evaluation summary without making changes
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const challengeId = url.searchParams.get('challengeId');
    const userId = url.searchParams.get('userId');

    let challenges;

    if (challengeId) {
      const challenge = await prisma.userChallenge.findUnique({
        where: { id: challengeId },
        include: {
          plan: true,
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

      challenges = [challenge];
    } else if (userId) {
      challenges = await prisma.userChallenge.findMany({
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
      });
    } else {
      challenges = await prisma.userChallenge.findMany({
        where: {
          status: 'ACTIVE',
        },
        include: {
          plan: true,
          metrics: {
            orderBy: { date: 'asc' },
          },
        },
      });
    }

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
    console.error('Challenge evaluation preview error:', error);
    return NextResponse.json(
      { error: 'Unable to preview evaluations.' },
      { status: 500 }
    );
  }
}
