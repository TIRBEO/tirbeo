import { NextResponse, NextRequest } from 'next/server';

const COOKIE_NAME = '__session';
const PUBLIC_ROUTES = ['/login', '/unauthorized', '/_next/static/', '/_next/image', '/favicon.ico'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.some(p => pathname.startsWith(p))) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.redirect(new URL('/login', request.url));

  try {
    const { jwtVerify } = await import('jose');
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me');
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
    if (!payload.sub) return NextResponse.redirect(new URL('/login', request.url));
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|login|unauthorized).*)'],
};
