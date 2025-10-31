import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/admin/login',
  '/admin/signup',
  '/trader/login',
  '/trader/signup',
  '/api/auth/login',
  '/api/auth/signup',
];

// Routes that require TRADER role
const traderRoutes = [
  '/dashboard/user',
  '/kyc',
  '/challenge-plans',
  '/payments',
  '/challenges',
  '/api/challenges',
  '/api/kyc',
  '/api/payment',
];

// Routes that require ADMIN role
const adminRoutes = [
  '/dashboard/admin',
  '/api/admin',
];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
}

function isTraderRoute(pathname: string): boolean {
  return traderRoutes.some(route => pathname.startsWith(route));
}

function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some(route => pathname.startsWith(route));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Skip middleware for Next.js internal routes and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // static files (images, fonts, etc.)
  ) {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    // No token - redirect to login
    const isAdminPath = isAdminRoute(pathname);
    const loginUrl = new URL(isAdminPath ? '/admin/login' : '/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  const payload = verifyToken(token);

  if (!payload) {
    // Invalid or expired token - clear cookie and redirect to login
    const isAdminPath = isAdminRoute(pathname);
    const loginUrl = new URL(isAdminPath ? '/admin/login' : '/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth-token');
    return response;
  }

  // Check role-based access
  if (isAdminRoute(pathname) && payload.role !== 'ADMIN') {
    // Trader trying to access admin routes
    return NextResponse.redirect(new URL('/dashboard/user', request.url));
  }

  if (isTraderRoute(pathname) && payload.role !== 'TRADER') {
    // Admin trying to access trader routes
    return NextResponse.redirect(new URL('/dashboard/admin', request.url));
  }

  // Valid token and correct role - allow access
  return NextResponse.next();
}

// Configure which routes use the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
