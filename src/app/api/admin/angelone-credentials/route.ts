import { NextRequest, NextResponse } from 'next/server';
import { updateAngelOneCredentials, getAngelOneSession } from '@/lib/angelone';

// GET - Retrieve current credentials (without sensitive data)
export async function GET(request: NextRequest) {
  try {
    const session = await getAngelOneSession();

    return NextResponse.json({
      success: true,
      data: {
        apiKey: session.apiKey,
        clientCode: session.clientCode,
        hasTokens: !!session.jwtToken,
        tokenExpiresAt: session.tokenExpiresAt,
      },
    });
  } catch (error: any) {
    console.error('Failed to get credentials:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get credentials' },
      { status: 500 }
    );
  }
}

// POST - Update credentials
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, clientCode, mpin, totpSecret } = body;

    if (!apiKey || !clientCode || !mpin || !totpSecret) {
      return NextResponse.json(
        { error: 'Missing required fields: apiKey, clientCode, mpin, totpSecret' },
        { status: 400 }
      );
    }

    await updateAngelOneCredentials({
      apiKey,
      clientCode,
      mpin,
      totpSecret,
    });

    return NextResponse.json({
      success: true,
      message: 'Credentials updated successfully',
    });
  } catch (error: any) {
    console.error('Failed to update credentials:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update credentials' },
      { status: 500 }
    );
  }
}

// PUT - Seed credentials from environment variables
export async function PUT(request: NextRequest) {
  try {
    const apiKey = process.env.ANGELONE_API_KEY;
    const clientCode = process.env.ANGELONE_CLIENT_CODE;
    const mpin = process.env.ANGELONE_MPIN;
    const totpSecret = process.env.ANGELONE_TOTP_SECRET;

    if (!apiKey || !clientCode || !mpin || !totpSecret) {
      return NextResponse.json(
        { 
          error: 'Missing AngelOne credentials in environment variables',
          details: 'Please set ANGELONE_API_KEY, ANGELONE_CLIENT_CODE, ANGELONE_MPIN, and ANGELONE_TOTP_SECRET in .env.local'
        },
        { status: 500 }
      );
    }

    await updateAngelOneCredentials({
      apiKey,
      clientCode,
      mpin,
      totpSecret,
    });

    return NextResponse.json({
      success: true,
      message: 'Credentials seeded from environment variables',
    });
  } catch (error: any) {
    console.error('Failed to seed credentials:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to seed credentials' },
      { status: 500 }
    );
  }
}
