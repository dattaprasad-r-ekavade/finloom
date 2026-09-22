import { NextResponse } from 'next/server';

/** Keep broker test integrations available locally while preventing production use. */
export function internalDevelopmentOnlyResponse() {
  if (process.env.NODE_ENV !== 'production') return null;

  return NextResponse.json(
    { error: 'This internal development integration is disabled in production.' },
    { status: 404 },
  );
}
