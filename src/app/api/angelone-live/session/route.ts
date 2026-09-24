import { NextRequest, NextResponse } from 'next/server';
import { getAngelOneSession } from '@/lib/angelone';
import { requireOneOfRoles } from '@/lib/apiAuth';
import { internalDevelopmentOnlyResponse } from '@/lib/internalDevelopment';

export async function GET(request: NextRequest) {
  const blocked = internalDevelopmentOnlyResponse();
  if (blocked) return blocked;
  try {
    const sessionUser = await requireOneOfRoles(request, ['TRADER', 'ADMIN']);
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await getAngelOneSession();

    return NextResponse.json({
      success: true,
      data: {
        authenticated: Boolean(session.jwtToken),
        tokenExpiresAt: session.tokenExpiresAt ?? null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to initialize session';
    console.error('Session initialization error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
