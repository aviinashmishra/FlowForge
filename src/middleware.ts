import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /auth/signin)
  const path = request.nextUrl.pathname;

  // Define paths that require authentication
  const protectedPaths = ['/dashboard', '/builder', '/profile'];
  
  // Define paths that should redirect authenticated users
  const authPaths = ['/auth/signin', '/auth/signup'];

  // Check if the path requires authentication
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path.startsWith(protectedPath)
  );

  // Check if the path is an auth page
  const isAuthPath = authPaths.some(authPath => 
    path.startsWith(authPath)
  );

  // Get the token from cookies
  const token = request.cookies.get('auth-token')?.value;

  // If accessing a protected path without a token, redirect to signin
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // If accessing an auth path with a token, redirect to dashboard
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};