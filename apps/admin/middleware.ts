import { NextResponse, NextRequest } from 'next/server';

const COOKIE_NAME = '__session';
const PUBLIC_ROUTES = ['/login', '/unauthorized', '/_next/static/', '/_next/image', '/favicon.ico'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.some(p => pathname.startsWith(p))) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.redirect(new URL('/login', request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|login|unauthorized).*)'],
};
