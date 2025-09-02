import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Public paths that should not be gated by auth
const PUBLIC_PATHS = [
  '/login',
  '/',
  '/favicon.ico',
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  // Allow Next.js internals and static assets
  if (pathname.startsWith('/_next')) return true;
  if (pathname.startsWith('/public')) return true;
  if (pathname.startsWith('/images') || pathname.startsWith('/assets')) return true;
  // Do not gate API routes here (they have their own server guard)
  if (pathname.startsWith('/api/')) return true;
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const hasAdminCookie = req.cookies.get('rl_admin')?.value === '1';
  if (!hasAdminCookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|static).*)'],
};


