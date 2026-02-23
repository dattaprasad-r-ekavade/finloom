import { NextRequest, NextResponse } from 'next/server';

const publicPageRoutes = [
  '/',
  '/about',
  '/contact',
  '/login',
  '/privacy',
  '/refund-policy',
  '/signup',
  '/terms',
  '/admin/login',
  '/admin/local-credentials',
  '/admin/signup',
  '/trader/login',
  '/trader/signup',
  '/unauthorized',
  '/forbidden',
];

const traderPagePrefixes = [
  '/dashboard/user',
  '/kyc',
  '/challenge-plans',
  '/payments',
  '/challenges',
  '/live-trading',
];

const adminPagePrefixes = ['/dashboard/admin'];

function isPublicPage(pathname: string): boolean {
  return publicPageRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function startsWithAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname.startsWith(prefix));
}

function decodePayload(base64url: string): Record<string, unknown> | null {
  try {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function base64UrlToBytes(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getRoleFromVerifiedToken(token: string): Promise<'TRADER' | 'ADMIN' | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = decodePayload(encodedHeader);
  if (!header || header.alg !== 'HS256') {
    return null;
  }

  const dataBytes = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);
  const signatureBytes = base64UrlToBytes(encodedSignature);
  const dataBuffer = new Uint8Array(dataBytes).buffer as ArrayBuffer;
  const signatureBuffer = new Uint8Array(signatureBytes).buffer as ArrayBuffer;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );

  const isValid = await crypto.subtle.verify('HMAC', key, signatureBuffer, dataBuffer);
  if (!isValid) {
    return null;
  }

  const payload = decodePayload(encodedPayload);
  if (!payload) {
    return null;
  }

  if (payload.role === 'ADMIN' || payload.role === 'TRADER') {
    return payload.role;
  }

  return null;
}

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/login';
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

function redirectToForbidden(request: NextRequest): NextResponse {
  const forbiddenUrl = request.nextUrl.clone();
  forbiddenUrl.pathname = '/forbidden';
  return NextResponse.redirect(forbiddenUrl);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  if (isPublicPage(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return redirectToLogin(request);
  }

  const role = await getRoleFromVerifiedToken(token);
  const isAdminPage = startsWithAny(pathname, adminPagePrefixes);
  const isTraderPage = startsWithAny(pathname, traderPagePrefixes);

  if (isAdminPage && role !== 'ADMIN') {
    return redirectToForbidden(request);
  }

  if (isTraderPage && role !== 'TRADER') {
    return redirectToForbidden(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
