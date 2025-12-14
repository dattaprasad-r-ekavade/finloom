import { NextRequest, NextResponse } from 'next/server';
import { getAngelOneSession } from '@/lib/angelone';

const ANGELONE_BASE_URL = 'https://apiconnect.angelone.in';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { exchange, searchScrip } = body;

    if (!exchange || !searchScrip) {
      return NextResponse.json(
        { error: 'Missing required fields: exchange, searchScrip' },
        { status: 400 }
      );
    }

    const session = await getAngelOneSession();

    const response = await fetch(`${ANGELONE_BASE_URL}/rest/secure/angelbroking/order/v1/searchScrip`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.jwtToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB',
        'X-ClientLocalIP': '192.168.1.1',
        'X-ClientPublicIP': '192.168.1.1',
        'X-MACAddress': '00:00:00:00:00:00',
        'X-PrivateKey': session.apiKey,
      },
      body: JSON.stringify({
        exchange: exchange,
        searchscrip: searchScrip,
      }),
    });

    const responseText = await response.text();
    let data;
    
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      return NextResponse.json(
        { 
          error: 'Invalid JSON response from AngelOne API',
          details: responseText.substring(0, 500)
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
  } catch (error: any) {
    console.error('Search scrip error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
