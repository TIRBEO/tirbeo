import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '../../../lib/db/prisma';
import { getSession } from '../../../lib/session';
import { logRequest } from '../../../lib/logger';

import {
  loginHandler,
  signupHandler,
  logoutHandler,
  profileHandler,
  requestEmailOtpHandler,
  verifyEmailOtpHandler,
  requestPhoneOtpHandler,
  verifyPhoneOtpHandler,
  googleAuthRedirectHandler,
  googleAuthCallbackHandler,
  githubAuthRedirectHandler,
  githubAuthCallbackHandler,
  verify2faLoginHandler,
  recovery2faLoginHandler,
  activityHandler,
  listWorkspacesHandler,
  createWorkspaceHandler,
  requestSignupOtpHandler,
  requestLoginOtpHandler,
  verifyLoginOtpHandler,
} from '../../../lib/authHandlers';

import {
  extendedProfileHandler,
  changePasswordHandler,
  sessionsHandler,
  notificationsHandler,
  integrationsHandler,
  userActivityHandler,
  preferencesHandler,
} from '../../../lib/userHandlers';

const appUrl = (subdomain: string, path: string) =>
  `https://${subdomain}.${process.env.NEXT_PUBLIC_APP_DOMAIN || 'tirbeo.app'}${path}`;

const INTERNAL_ROUTES = [
  'auth/login', 'auth/signup', 'auth/logout',
  'auth/email-otp/request', 'auth/email-otp/verify',
  'auth/phone-otp/request', 'auth/phone-otp/verify',
  'auth/signup-otp/request',
  'auth/login-otp/request', 'auth/login-otp/verify',
  'auth/google', 'auth/google/callback', 'auth/github', 'auth/github/callback',
  'auth/verify-2fa', 'auth/recovery-2fa',
  'users/me', 'activity', 'workspaces',
  'profile', 'security/password', 'security/sessions',
  'notifications', 'integrations', 'user/activity', 'preferences',
];

async function loadRoutes() {
  return prisma.route.findMany({ where: { enabled: true } });
}

async function loadBlocked() {
  return prisma.blocklist.findMany();
}

function matchRoute(slug: string[], method: string, routes: any[]) {
  const pathPart = slug.join('/');
  const dbRoute = routes.find(
    (r) => r.path === pathPart && r.method.toUpperCase() === method.toUpperCase()
  );
  if (dbRoute) return dbRoute;
  if (INTERNAL_ROUTES.includes(pathPart)) {
    const methodMap: Record<string, string[]> = {
      'auth/login': ['POST'],
      'auth/signup': ['POST'],
      'auth/logout': ['POST'],
      'auth/email-otp/request': ['POST'],
      'auth/email-otp/verify': ['POST'],
      'auth/phone-otp/request': ['POST'],
      'auth/phone-otp/verify': ['POST'],
      'auth/signup-otp/request': ['POST'],
      'auth/login-otp/request': ['POST'],
      'auth/login-otp/verify': ['POST'],
      'auth/google': ['GET'],
      'auth/google/callback': ['GET'],
      'auth/github': ['GET'],
      'auth/github/callback': ['GET'],
      'auth/verify-2fa': ['POST'],
      'auth/recovery-2fa': ['POST'],
      'users/me': ['GET', 'PATCH'],
      'activity': ['GET'],
      'workspaces': ['GET', 'POST'],
      'profile': ['GET', 'PATCH'],
      'security/password': ['POST'],
      'security/sessions': ['GET', 'DELETE'],
      'notifications': ['GET', 'PATCH'],
      'integrations': ['GET', 'POST', 'DELETE'],
      'user/activity': ['GET'],
      'preferences': ['GET', 'PATCH'],
    };
    const allowed = methodMap[pathPart];
    if (allowed && allowed.includes(method.toUpperCase())) {
      return { path: pathPart, method, internal: true, allowedRoles: ['guest'] };
    }
  }
  return undefined;
}

function isBlocked(ip?: string, userId?: string, blocked: any[] = []) {
  return blocked.some((entry: any) => entry.ip === ip || entry.userId === userId);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return handler(request, slug, 'GET');
}
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return handler(request, slug, 'POST');
}
export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return handler(request, slug, 'PUT');
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return handler(request, slug, 'DELETE');
}
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return handler(request, slug, 'PATCH');
}

async function handler(request: NextRequest, slug: string[], method: string) {
  const ip = request.headers.get('x-forwarded-for') || '';
  const session = await getSession(request);

  const [routes, blocked] = await Promise.all([loadRoutes(), loadBlocked()]);

  if (isBlocked(ip, session?.userId, blocked)) {
    await logRequest({ ip, method, path: slug.join('/'), userId: session?.userId, status: 403 });
    return new NextResponse('Blocked', { status: 403 });
  }

  const route = matchRoute(slug, method, routes);
  if (!route) {
    await logRequest({ ip, method, path: slug.join('/'), userId: session?.userId, status: 404 });
    return new NextResponse('Route not configured', { status: 404 });
  }

  if (route.internal) {
    let resp: NextResponse;
    switch (route.path) {
      case 'auth/login':
        resp = await loginHandler(request);
        break;
      case 'auth/signup':
        resp = await signupHandler(request);
        break;
      case 'auth/logout':
        resp = await logoutHandler(request);
        break;
      case 'users/me':
        resp = await profileHandler(request);
        break;
      case 'auth/email-otp/request':
        resp = await requestEmailOtpHandler(request);
        break;
      case 'auth/email-otp/verify':
        resp = await verifyEmailOtpHandler(request);
        break;
      case 'auth/phone-otp/request':
        resp = await requestPhoneOtpHandler(request);
        break;
      case 'auth/phone-otp/verify':
        resp = await verifyPhoneOtpHandler(request);
        break;
      case 'auth/signup-otp/request':
        resp = await requestSignupOtpHandler(request);
        break;
      case 'auth/login-otp/request':
        resp = await requestLoginOtpHandler(request);
        break;
      case 'auth/login-otp/verify':
        resp = await verifyLoginOtpHandler(request);
        break;
      case 'auth/google':
        resp = await googleAuthRedirectHandler(request);
        break;
      case 'auth/google/callback':
        resp = await googleAuthCallbackHandler(request);
        break;
      case 'auth/github':
        resp = await githubAuthRedirectHandler(request);
        break;
      case 'auth/github/callback':
        resp = await githubAuthCallbackHandler(request);
        break;
      case 'auth/verify-2fa':
        resp = await verify2faLoginHandler(request);
        break;
      case 'auth/recovery-2fa':
        resp = await recovery2faLoginHandler(request);
        break;
      case 'activity':
        resp = await activityHandler(request);
        break;
      case 'workspaces':
        if (method === 'GET') resp = await listWorkspacesHandler(request);
        else if (method === 'POST') resp = await createWorkspaceHandler(request);
        else resp = new NextResponse('Method not allowed', { status: 405 });
        break;
      case 'profile':
        resp = await extendedProfileHandler(request);
        break;
      case 'security/password':
        resp = await changePasswordHandler(request);
        break;
      case 'security/sessions':
        resp = await sessionsHandler(request);
        break;
      case 'notifications':
        resp = await notificationsHandler(request);
        break;
      case 'integrations':
        resp = await integrationsHandler(request);
        break;
      case 'user/activity':
        resp = await userActivityHandler(request);
        break;
      case 'preferences':
        resp = await preferencesHandler(request);
        break;
      default:
        resp = new NextResponse('Internal route not implemented', { status: 501 });
    }
    await logRequest({ ip, method, path: slug.join('/'), userId: session?.userId, status: resp.status });
    return resp;
  }

  let userRole = 'guest';
  if (session?.userId) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { adminRole: true },
    });
    userRole = user?.adminRole || 'member';
  }
  if (!route.allowedRoles.includes(userRole)) {
    await logRequest({ ip, method, path: slug.join('/'), userId: session?.userId, status: 403 });
    return new NextResponse('Forbidden', { status: 403 });
  }

  let targetUrl: string;
  if (route.target) {
    targetUrl = `${route.target}${request.nextUrl.search}`;
  } else {
    const [subdomain, ...rest] = route.path.split('/');
    const targetBase = appUrl(subdomain, '/' + rest.join('/'));
    targetUrl = `${targetBase}${request.nextUrl.search}`;
  }

  const init: RequestInit = {
    method,
    headers: {
      ...(session?.userId && { 'x-user-id': session.userId }),
      'content-type': request.headers.get('content-type') || '',
    },
    body: method !== 'GET' && method !== 'HEAD' ? await request.text() : undefined,
  };

  const upstreamResponse = await fetch(targetUrl, init);
  const responseHeaders = new Headers(upstreamResponse.headers);
  const response = new NextResponse(await upstreamResponse.text(), {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });

  await logRequest({ ip, method, path: slug.join('/'), userId: session?.userId, status: upstreamResponse.status });
  return response;
}
