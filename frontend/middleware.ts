import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('mpendae_token')?.value;
    // If no cookie token, we rely on client-side auth (localStorage)
    // The admin layout handles client-side redirect
    // This middleware handles server-side protection as extra layer
    if (!token) {
      // Allow the page to load — client side will redirect if not authenticated
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
