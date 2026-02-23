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
    const { apiKey, jwtToken, mode, exchangeTokens } = body;

    if (!apiKey || !jwtToken || !mode || !exchangeTokens) {
      return NextResponse.json(
        { error: 'Missing required fields: apiKey, jwtToken, mode, exchangeTokens' },
        { status: 400 }
      );
    }

    // Log the request for debugging
    console.log('Market Data Request:', {
      mode,
      exchangeTokens,
      requestBody: JSON.stringify({ mode, exchangeTokens })
    });

    const response = await fetch(`${ANGELONE_BASE_URL}/rest/secure/angelbroking/market/v1/quote/`, {
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
        mode: mode,
        exchangeTokens: exchangeTokens,
      }),
    });

    // Get response text first
    const responseText = await response.text();
    
    // Log response for debugging
    console.log('Market Data Response:', {
      status: response.status,
      statusText: response.statusText,
      body: responseText.substring(0, 1000)
    });
    
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
          error: data.message || 'Failed to fetch market data',
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
    console.error('AngelOne market data error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
