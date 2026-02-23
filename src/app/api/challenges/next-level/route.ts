import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/apiAuth';

async function getProgressionData(userId: string) {
  // Get all user's challenges ordered by level
  const userChallenges = await prisma.userChallenge.findMany({
    where: { userId },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  });

  // Determine highest completed level
  let highestPassedLevel = 0;
  const passedChallenges = userChallenges.filter((c) => c.status === 'PASSED');

  if (passedChallenges.length > 0) {
    highestPassedLevel = Math.max(...passedChallenges.map((c) => c.plan.level));
  }

  // Get current active challenge
  const activeChallenge = userChallenges.find((c) => c.status === 'ACTIVE');

  // Determine next available level
  const nextLevel = highestPassedLevel + 1;

  // If user has active challenge at current level, they can't start another
  if (activeChallenge && activeChallenge.plan.level >= nextLevel) {
    return {
      canProgress: false,
      reason: 'You have an active challenge. Complete it before starting a new one.',
      highestPassedLevel,
      activeLevel: activeChallenge.plan.level,
      nextLevel: null,
      nextPlan: null,
      unlockedLevels: Array.from({ length: highestPassedLevel }, (_, i) => i + 1),
    };
  }

  // Check if user has reached max level
  if (nextLevel > 3) {
    return {
      canProgress: false,
      reason: 'Congratulations! You have completed all challenge levels.',
      highestPassedLevel,
      activeLevel: null,
      nextLevel: null,
      nextPlan: null,
      unlockedLevels: [1, 2, 3],
      maxLevelReached: true,
    };
  }

  // Get the next level plan
  const nextPlan = await prisma.challengePlan.findFirst({
    where: {
      level: nextLevel,
      isActive: true,
    },
  });

  if (!nextPlan) {
    return {
      error: `Challenge plan for level ${nextLevel} not found.`,
      status: 404,
    };
  }

  // Get all available plans for the unlocked levels
  const unlockedLevels = Array.from({ length: highestPassedLevel + 1 }, (_, i) => i + 1);

  const availablePlans = await prisma.challengePlan.findMany({
    where: {
      level: { in: unlockedLevels },
      isActive: true,
    },
    orderBy: { level: 'asc' },
  });

  return {
    canProgress: true,
    reason: 'You are eligible to start the next level challenge.',
    highestPassedLevel,
    activeLevel: activeChallenge ? activeChallenge.plan.level : null,
    nextLevel,
    nextPlan: {
      id: nextPlan.id,
      name: nextPlan.name,
      level: nextPlan.level,
      accountSize: nextPlan.accountSize,
      profitTargetPct: nextPlan.profitTargetPct,
      maxLossPct: nextPlan.maxLossPct,
      dailyLossPct: nextPlan.dailyLossPct,
      fee: nextPlan.fee,
      durationDays: nextPlan.durationDays,
      profitSplit: nextPlan.profitSplit,
      allowedInstruments: nextPlan.allowedInstruments,
    },
    unlockedLevels,
    availablePlans: availablePlans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      level: plan.level,
      accountSize: plan.accountSize,
      profitTargetPct: plan.profitTargetPct,
      maxLossPct: plan.maxLossPct,
      dailyLossPct: plan.dailyLossPct,
      fee: plan.fee,
      durationDays: plan.durationDays,
      profitSplit: plan.profitSplit,
      allowedInstruments: plan.allowedInstruments,
    })),
    challengeHistory: userChallenges.map((c) => ({
      id: c.id,
      level: c.plan.level,
      status: c.status,
      startDate: c.startDate,
      endDate: c.endDate,
    })),
  };
}

/**
 * GET /api/challenges/next-level
 * Returns the next available challenge level for the authenticated trader
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, 'TRADER');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const progression = await getProgressionData(session.userId);
    if ('error' in progression) {
      return NextResponse.json({ error: progression.error }, { status: progression.status });
    }

    return NextResponse.json(progression);
  } catch (error) {
    console.error('Next level fetch error:', error);
    return NextResponse.json(
      { error: 'Unable to fetch next level information.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/challenges/next-level
 * Validates and returns next-level eligibility for the authenticated trader
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(request, 'TRADER');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const progressData = await getProgressionData(session.userId);
    if ('error' in progressData) {
      return NextResponse.json({ error: progressData.error }, { status: progressData.status });
    }

    if (!progressData.canProgress) {
      return NextResponse.json(
        { error: progressData.reason },
        { status: 400 }
      );
    }

    // Return next plan details for selection
    return NextResponse.json({
      message: 'Next level challenge available.',
      nextPlan: progressData.nextPlan,
      nextLevel: progressData.nextLevel,
      highestPassedLevel: progressData.highestPassedLevel,
    });
  } catch (error) {
    console.error('Next level creation error:', error);
    return NextResponse.json(
      { error: 'Unable to process next level request.' },
      { status: 500 }
    );
  }
}
