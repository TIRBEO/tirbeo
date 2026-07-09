import { NextResponse, NextRequest } from 'next/server';

// Session lives on the API domain (host-only cookie), not the admin domain.
// Auth guard is handled client-side: 401 responses redirect to /login.
// Middleware only passes through — no cookie check needed.

export async function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|login|unauthorized).*)'],
};
