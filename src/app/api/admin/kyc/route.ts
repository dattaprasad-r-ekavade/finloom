import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

// Helper to verify admin access
async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return null;
  }
  
  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'ADMIN') {
    return null;
  }
  
  return decoded;
}

// Get all KYC submissions or a specific user's KYC
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    // If userId is provided, return specific user's KYC
    if (userId) {
      const kycRecord = await prisma.mockedKYC.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              createdAt: true,
            },
          },
        },
      });

      if (!kycRecord) {
        return NextResponse.json(
          { success: false, error: 'KYC record not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: kycRecord,
      });
    }

    // Otherwise, return all KYC submissions
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const kycSubmissions = await prisma.mockedKYC.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: kycSubmissions,
    });
  } catch (error) {
    console.error('Error fetching KYC submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch KYC submissions' },
      { status: 500 }
    );
  }
}

// Approve or reject KYC
export async function PUT(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { kycId, action } = body;

    if (!kycId || !action) {
      return NextResponse.json(
        { success: false, error: 'KYC ID and action are required' },
        { status: 400 }
      );
    }

    if (action !== 'APPROVE' && action !== 'REJECT') {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be APPROVE or REJECT' },
        { status: 400 }
      );
    }

    const updateData: any = {
      status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
    };

    if (action === 'APPROVE') {
      updateData.approvedAt = new Date();
      updateData.approvedBy = admin.userId;
      updateData.rejectedAt = null;
      updateData.rejectedBy = null;
    } else {
      updateData.rejectedAt = new Date();
      updateData.rejectedBy = admin.userId;
      updateData.approvedAt = null;
      updateData.approvedBy = null;
    }

    const updatedKyc = await prisma.mockedKYC.update({
      where: { id: kycId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `KYC ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully`,
      data: updatedKyc,
    });
  } catch (error) {
    console.error('Error updating KYC status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update KYC status' },
      { status: 500 }
    );
  }
}
