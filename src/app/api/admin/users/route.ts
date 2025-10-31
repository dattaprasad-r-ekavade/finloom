import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Filters
    const role = searchParams.get('role');
    const kycStatus = searchParams.get('kycStatus');
    const hasActiveChallenge = searchParams.get('hasActiveChallenge');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {};
    
    if (role) {
      where.role = role;
    }
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    // KYC filter
    if (kycStatus === 'APPROVED') {
      where.mockedKyc = {
        isNot: null,
      };
    } else if (kycStatus === 'PENDING') {
      where.mockedKyc = {
        is: null,
      };
    }

    // Active challenge filter
    if (hasActiveChallenge === 'true') {
      where.challenges = {
        some: {
          status: 'ACTIVE',
        },
      };
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users with related data
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        mockedKyc: {
          select: {
            status: true,
            approvedAt: true,
          },
        },
        challenges: {
          select: {
            id: true,
            status: true,
            plan: {
              select: {
                name: true,
                level: true,
              },
            },
          },
        },
        mockedPayments: {
          select: {
            amount: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform data
    const transformedUsers = users.map((user) => {
      const kycApproved = user.mockedKyc !== null && user.mockedKyc.status === 'AUTO_APPROVED';
      const activeChallenges = user.challenges.filter((c) => c.status === 'ACTIVE');
      const passedChallenges = user.challenges.filter((c) => c.status === 'PASSED');
      const failedChallenges = user.challenges.filter((c) => c.status === 'FAILED');
      const totalSpent = user.mockedPayments
        .filter((p) => p.status === 'SUCCESS')
        .reduce((sum, p) => sum + p.amount, 0);

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        kycStatus: kycApproved ? 'APPROVED' : 'PENDING',
        kycApprovedAt: user.mockedKyc?.approvedAt || null,
        activeChallengesCount: activeChallenges.length,
        passedChallengesCount: passedChallenges.length,
        failedChallengesCount: failedChallenges.length,
        totalChallenges: user.challenges.length,
        totalSpent,
        activeChallenges: activeChallenges.map((c) => ({
          id: c.id,
          planName: c.plan.name,
          level: c.plan.level,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
