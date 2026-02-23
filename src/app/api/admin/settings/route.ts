import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/apiAuth';

// Get admin settings
export async function GET(request: NextRequest) {
  try {
    const admin = await requireRole(request, 'ADMIN');
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get or create settings (there should only be one settings record)
    let settings = await prisma.adminSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.adminSettings.create({
        data: {
          autoApproveKyc: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// Update admin settings
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
    const { autoApproveKyc } = body;

    if (typeof autoApproveKyc !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'autoApproveKyc must be a boolean' },
        { status: 400 }
      );
    }

    // Get or create settings
    let settings = await prisma.adminSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.adminSettings.create({
        data: {
          autoApproveKyc,
        },
      });
    } else {
      settings = await prisma.adminSettings.update({
        where: { id: settings.id },
        data: {
          autoApproveKyc,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings,
    });
  } catch (error) {
    console.error('Error updating admin settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
