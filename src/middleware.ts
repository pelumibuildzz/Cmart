import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const pathname = request.nextUrl.pathname;

  // Define protected routes
  const businessProtectedRoutes = ['/business', '/business/dashboard'];
  const authProtectedRoutes = ['/profile', '/orders', '/checkout'];
  const authRoutes = ['/auth/signin', '/auth/signup'];

  // Redirect authenticated users away from authentication pages
  if (token && authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Check for authenticated routes
  if (authProtectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Check for business protected routes
  if (businessProtectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    // Check if user has business role
    if (token.role !== 'BUSINESS' && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/business/:path*',
    '/orders/:path*',
    '/checkout/:path*',
    '/auth/:path*',
  ],
}; 