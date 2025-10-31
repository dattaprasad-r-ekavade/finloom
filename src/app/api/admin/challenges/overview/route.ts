import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all challenges with related data
    const allChallenges = await prisma.userChallenge.findMany({
      select: {
        id: true,
        status: true,
        startDate: true,
        endDate: true,
        plan: {
          select: {
            level: true,
            fee: true,
          },
        },
        mockedPayments: {
          select: {
            amount: true,
            status: true,
            paidAt: true,
          },
        },
      },
    });

    // Calculate statistics
    const totalChallenges = allChallenges.length;
    const activeChallenges = allChallenges.filter((c) => c.status === 'ACTIVE').length;
    const passedChallenges = allChallenges.filter((c) => c.status === 'PASSED').length;
    const failedChallenges = allChallenges.filter((c) => c.status === 'FAILED').length;
    const pendingChallenges = allChallenges.filter((c) => c.status === 'PENDING').length;

    // Calculate pass rate
    const completedChallenges = passedChallenges + failedChallenges;
    const passRate = completedChallenges > 0 ? (passedChallenges / completedChallenges) * 100 : 0;

    // Calculate revenue by level
    const revenueByLevel = allChallenges.reduce(
      (acc, challenge) => {
        const level = challenge.plan.level;
        const payments = challenge.mockedPayments.filter((p) => p.status === 'SUCCESS');
        const revenue = payments.reduce((sum, p) => sum + p.amount, 0);

        if (!acc[level]) {
          acc[level] = {
            level,
            revenue: 0,
            challengeCount: 0,
          };
        }

        acc[level].revenue += revenue;
        acc[level].challengeCount += 1;

        return acc;
      },
      {} as Record<number, { level: number; revenue: number; challengeCount: number }>
    );

    const revenueByLevelArray = Object.values(revenueByLevel).sort((a, b) => a.level - b.level);

    // Calculate total revenue
    const totalRevenue = revenueByLevelArray.reduce((sum, level) => sum + level.revenue, 0);

    // Calculate average completion time for completed challenges
    const completedChallengesWithDates = allChallenges.filter(
      (c) => (c.status === 'PASSED' || c.status === 'FAILED') && c.startDate && c.endDate
    );

    let avgCompletionTimeDays = 0;
    if (completedChallengesWithDates.length > 0) {
      const totalDays = completedChallengesWithDates.reduce((sum, c) => {
        const start = new Date(c.startDate!).getTime();
        const end = new Date(c.endDate!).getTime();
        const days = (end - start) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0);
      avgCompletionTimeDays = totalDays / completedChallengesWithDates.length;
    }

    // Get recent challenges with user info
    const recentChallenges = await prisma.userChallenge.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        currentPnl: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        plan: {
          select: {
            name: true,
            level: true,
            accountSize: true,
          },
        },
      },
    });

    // Get total users and KYC approved users
    const totalUsers = await prisma.user.count();
    const kycApprovedUsers = await prisma.mockedKYC.count();

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalChallenges,
          activeChallenges,
          passedChallenges,
          failedChallenges,
          pendingChallenges,
          passRate: parseFloat(passRate.toFixed(2)),
          totalRevenue,
          avgCompletionTimeDays: parseFloat(avgCompletionTimeDays.toFixed(1)),
        },
        revenueByLevel: revenueByLevelArray,
        recentChallenges: recentChallenges.map((c) => ({
          id: c.id,
          status: c.status,
          userName: c.user.name || 'Unknown',
          userEmail: c.user.email,
          planName: c.plan.name,
          planLevel: c.plan.level,
          accountSize: c.plan.accountSize,
          currentPnl: c.currentPnl,
          startDate: c.startDate,
          endDate: c.endDate,
          createdAt: c.createdAt,
        })),
        userStats: {
          totalUsers,
          kycApprovedUsers,
          kycApprovalRate:
            totalUsers > 0 ? parseFloat(((kycApprovedUsers / totalUsers) * 100).toFixed(2)) : 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching challenge overview:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch challenge overview' },
      { status: 500 }
    );
  }
}
