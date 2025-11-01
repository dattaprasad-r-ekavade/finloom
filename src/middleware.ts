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

  // Skip middleware for Next.js internal routes and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // static files (images, fonts, etc.)
  ) {
    return NextResponse.next();
  }

  // Let all routes through - authentication will be handled by individual pages/API routes
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
