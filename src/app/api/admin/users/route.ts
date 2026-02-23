import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  try {
    const admin = await requireRole(request, 'ADMIN');
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    
    // Pagination
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get('limit') || '10', 10), 1),
      100
    );
    const skip = (page - 1) * limit;
    
    // Filters
    const role = searchParams.get('role');
    const kycStatus = searchParams.get('kycStatus');
    const hasActiveChallenge = searchParams.get('hasActiveChallenge');
    const search = searchParams.get('search');

    // Build where clause
    const where: Prisma.UserWhereInput = {};
    
    if (role === 'TRADER' || role === 'ADMIN') {
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
        is: {
          status: {
            in: ['APPROVED', 'AUTO_APPROVED'],
          },
        },
      };
    } else if (kycStatus === 'PENDING') {
      const currentAnd = Array.isArray(where.AND)
        ? where.AND
        : where.AND
          ? [where.AND]
          : [];

      where.AND = [
        ...currentAnd,
        {
          OR: [
            { mockedKyc: { is: null } },
            {
              mockedKyc: {
                is: {
                  status: {
                    in: ['PENDING', 'REJECTED'],
                  },
                },
              },
            },
          ],
        },
      ];
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
      const kycApproved = user.mockedKyc !== null && (user.mockedKyc.status === 'AUTO_APPROVED' || user.mockedKyc.status === 'APPROVED');
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

// UPDATE user
export async function PUT(request: NextRequest) {
  try {
    const admin = await requireRole(request, 'ADMIN');
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, name, role, email } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const updateData: Prisma.UserUpdateInput = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (email !== undefined) {
      // Check if email is already taken by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase().trim(),
          NOT: { id: userId }
        }
      });
      
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Email already in use' },
          { status: 400 }
        );
      }
      
      updateData.email = email.toLowerCase().trim();
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireRole(request, 'ADMIN');
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prevent admin from deleting themselves
    if (userId === admin.userId) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
