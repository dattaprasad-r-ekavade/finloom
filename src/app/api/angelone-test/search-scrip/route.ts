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
    const { apiKey, jwtToken, exchange, searchScrip } = body;

    if (!apiKey || !jwtToken || !exchange || !searchScrip) {
      return NextResponse.json(
        { error: 'Missing required fields: apiKey, jwtToken, exchange, searchScrip' },
        { status: 400 }
      );
    }

    const response = await fetch(`${ANGELONE_BASE_URL}/rest/secure/angelbroking/order/v1/searchScrip`, {
      method: 'POST',
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
      body: JSON.stringify({
        exchange: exchange,
        searchscrip: searchScrip,
      }),
    });

    // Get response text first
    const responseText = await response.text();
    
    // Try to parse as JSON
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      return NextResponse.json(
        { 
          error: 'Invalid JSON response from AngelOne API',
          details: {
            status: response.status,
            statusText: response.statusText,
            body: responseText.substring(0, 500)
          }
        },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: data.message || 'Failed to search scrip',
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
    console.error('AngelOne search scrip error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
