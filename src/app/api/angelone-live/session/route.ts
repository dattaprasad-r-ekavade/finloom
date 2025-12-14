import { NextRequest, NextResponse } from 'next/server';
import { getAngelOneSession } from '@/lib/angelone';

export async function GET(request: NextRequest) {
  try {
    const session = await getAngelOneSession();

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    console.error('Session initialization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize session' },
      { status: 500 }
    );
  }
}
