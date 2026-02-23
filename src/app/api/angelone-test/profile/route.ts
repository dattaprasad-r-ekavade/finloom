import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/apiAuth';

const ANGELONE_BASE_URL = 'https://apiconnect.angelone.in';

export async function POST(request: NextRequest) {
  try {
    const admin = await requireRole(request, 'ADMIN');
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { apiKey, jwtToken } = body;

    if (!apiKey || !jwtToken) {
      return NextResponse.json(
        { error: 'Missing required fields: apiKey, jwtToken' },
        { status: 400 }
      );
    }

    const response = await fetch(`${ANGELONE_BASE_URL}/rest/secure/angelbroking/user/v1/getProfile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB',
        'X-ClientLocalIP': '192.168.1.1',
        'X-ClientPublicIP': '192.168.1.1',
        'X-MACAddress': '00:00:00:00:00:00',
        'X-PrivateKey': apiKey,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: data.message || 'Failed to fetch profile',
          details: data 
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('AngelOne profile error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
