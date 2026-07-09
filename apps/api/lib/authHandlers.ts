import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from './db/prisma';
import { generateOtpCode, storeOtp, verifyOtpCode, sendEmailOtp, sendPhoneOtp } from './auth/otp';
import { generateOtpCode as genSignupOtp, storeSignupOtp, verifySignupOtp, sendSignupOtpEmail } from './auth/signup-otp';
import { hashPassword, verifyPassword } from './auth/password';
import { createSession, setSessionCookie, clearSessionCookie, revokeSession, getSession } from './session';
import { signTemp2faToken, verifyTemp2faToken } from './auth/jwt';
import { verifyTotp } from './auth/totp';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function loginHandler(request: NextRequest) {
  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) {
      return new NextResponse('Invalid email or password', { status: 400 });
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(user.passwordHash, password))) {
      return new NextResponse('Invalid email or password', { status: 401 });
    }

    if (user.is2FAEnabled) {
      const tempToken = await signTemp2faToken(user.id);
      return NextResponse.json({ needs2FA: true, tempToken, userId: user.id });
    }

    const ip = request.headers.get('x-forwarded-for') || '';
    const { token } = await createSession(user.id, request.headers.get('user-agent') || undefined, ip);
    const res = NextResponse.json({ id: user.id, email: user.email });
    setSessionCookie(res, token);
    return res;
  } catch {
    return new NextResponse('Login failed', { status: 400 });
  }
}

export async function verify2faLoginHandler(request: NextRequest) {
  try {
    const { tempToken, token: totpCode } = await request.json();
    if (typeof tempToken !== 'string' || typeof totpCode !== 'string') {
      return new NextResponse('Invalid payload', { status: 400 });
    }

    const userId = await verifyTemp2faToken(tempToken);
    if (!userId) return new NextResponse('Invalid or expired temp token', { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.totpSecret || !user.is2FAEnabled) {
      return new NextResponse('2FA not enabled', { status: 400 });
    }

    if (!await verifyTotp(totpCode, user.totpSecret)) {
      return new NextResponse('Invalid 2FA code', { status: 401 });
    }

    const ip = request.headers.get('x-forwarded-for') || '';
    const { token } = await createSession(user.id, request.headers.get('user-agent') || undefined, ip);
    const res = NextResponse.json({ id: user.id, email: user.email });
    setSessionCookie(res, token);
    return res;
  } catch {
    return new NextResponse('2FA verification failed', { status: 400 });
  }
}

export async function recovery2faLoginHandler(request: NextRequest) {
  try {
    const { tempToken, recoveryCode } = await request.json();
    if (typeof tempToken !== 'string' || typeof recoveryCode !== 'string') {
      return new NextResponse('Invalid payload', { status: 400 });
    }

    const userId = await verifyTemp2faToken(tempToken);
    if (!userId) return new NextResponse('Invalid or expired temp token', { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.is2FAEnabled) {
      return new NextResponse('2FA not enabled', { status: 400 });
    }

    const rc = await prisma.recoveryCode.findFirst({
      where: { userId, code: recoveryCode, used: false },
    });
    if (!rc) return new NextResponse('Invalid recovery code', { status: 401 });

    await prisma.recoveryCode.update({
      where: { id: rc.id },
      data: { used: true, usedAt: new Date() },
    });

    const ip = request.headers.get('x-forwarded-for') || '';
    const { token } = await createSession(user.id, request.headers.get('user-agent') || undefined, ip);
    const res = NextResponse.json({ id: user.id, email: user.email });
    setSessionCookie(res, token);
    return res;
  } catch {
    return new NextResponse('Recovery code verification failed', { status: 400 });
  }
}

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
  otpCode: z.string().length(6).optional(),
});

export async function signupHandler(request: NextRequest) {
  try {
    const parsed = signupSchema.safeParse(await request.json());
    if (!parsed.success) {
      return new NextResponse('Invalid request payload', { status: 400 });
    }
    const { email, password, name, otpCode } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return new NextResponse('Email already registered', { status: 409 });
    }

    if (!otpCode) {
      return new NextResponse('Verification code required', { status: 400 });
    }

    const otpOk = await verifySignupOtp(email, otpCode);
    if (!otpOk) {
      return new NextResponse('Invalid or expired verification code', { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const adminCount = await prisma.user.count({ where: { adminRole: { not: null } } });
    const user = await prisma.user.create({
      data: { email, passwordHash, name, adminRole: adminCount === 0 ? 'super_admin' : undefined },
    });

    const ip = request.headers.get('x-forwarded-for') || '';
    const { token } = await createSession(user.id, request.headers.get('user-agent') || undefined, ip);
    const res = NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
    setSessionCookie(res, token);
    return res;
  } catch (err) {
    console.error('[SIGNUP]', err);
    return new NextResponse('Signup failed', { status: 400 });
  }
}

export async function requestSignupOtpHandler(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== 'string') {
      return new NextResponse('Email is required', { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return new NextResponse('Email already registered', { status: 409 });
    }

    const code = genSignupOtp();
    await storeSignupOtp(email, code);
    await sendSignupOtpEmail(email, code);
    return new NextResponse('Verification code sent to email', { status: 200 });
  } catch (err) {
    console.error('[SIGNUP OTP REQUEST]', err);
    return new NextResponse('Failed to send code', { status: 500 });
  }
}

export async function requestLoginOtpHandler(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== 'string') {
      return new NextResponse('Email is required', { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return new NextResponse('No account found with this email', { status: 404 });
    }

    const code = genSignupOtp();
    await storeSignupOtp(email, code);
    await sendSignupOtpEmail(email, code);
    return new NextResponse('Verification code sent to your email', { status: 200 });
  } catch (err) {
    console.error('[LOGIN OTP REQUEST]', err);
    return new NextResponse('Failed to send code', { status: 500 });
  }
}

export async function verifyLoginOtpHandler(request: NextRequest) {
  try {
    const { email, otpCode } = await request.json();
    if (!email || typeof email !== 'string' || !otpCode || typeof otpCode !== 'string') {
      return new NextResponse('Email and code are required', { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return new NextResponse('No account found with this email', { status: 404 });
    }

    const otpOk = await verifySignupOtp(email, otpCode);
    if (!otpOk) {
      return new NextResponse('Invalid or expired verification code', { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for') || '';
    const { token } = await createSession(user.id, request.headers.get('user-agent') || undefined, ip);
    const res = NextResponse.json({ id: user.id, email: user.email });
    setSessionCookie(res, token);
    return res;
  } catch (err) {
    console.error('[LOGIN OTP VERIFY]', err);
    return new NextResponse('Verification failed', { status: 500 });
  }
}

export async function logoutHandler(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (session) {
      await revokeSession(session.sessionId);
    }
    const res = new NextResponse('Logged out', { status: 200 });
    clearSessionCookie(res);
    return res;
  } catch {
    return new NextResponse('Logout failed', { status: 400 });
  }
}

// Email OTP - request
export async function requestEmailOtpHandler(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || !user.email) return new NextResponse('User email missing', { status: 400 });
  const code = generateOtpCode();
  await storeOtp(session.userId, 'email', code);
  await sendEmailOtp(user.email, code);
  return new NextResponse('OTP sent to email', { status: 200 });
}

// Email OTP - verify
export async function verifyEmailOtpHandler(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });
  const { code } = await request.json();
  if (typeof code !== 'string') return new NextResponse('Invalid OTP payload', { status: 400 });
  const ok = await verifyOtpCode(session.userId, 'email', code);
  if (!ok) return new NextResponse('Invalid or expired OTP', { status: 400 });
  // Mark email as verified – for simplicity we set secondaryEmail to email if not set
  await prisma.user.update({
    where: { id: session.userId },
    data: { secondaryEmail: undefined }, // placeholder – real verification flag could be added later
  });
  return new NextResponse('Email OTP verified', { status: 200 });
}

// Phone OTP - request
export async function requestPhoneOtpHandler(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || !user.phoneNumber) return new NextResponse('User phone missing', { status: 400 });
  const code = generateOtpCode();
  await storeOtp(session.userId, 'phone', code);
  await sendPhoneOtp(user.phoneNumber, code);
  return new NextResponse('OTP sent to phone', { status: 200 });
}

// Phone OTP - verify
export async function verifyPhoneOtpHandler(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });
  const { code } = await request.json();
  if (typeof code !== 'string') return new NextResponse('Invalid OTP payload', { status: 400 });
  const ok = await verifyOtpCode(session.userId, 'phone', code);
  if (!ok) return new NextResponse('Invalid or expired OTP', { status: 400 });
  // In a real system, mark phone as verified; placeholder no-op.
  return new NextResponse('Phone OTP verified', { status: 200 });
}

// Google OAuth - start flow
export async function googleAuthRedirectHandler(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return new NextResponse('Google OAuth not configured', { status: 500 });
  }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return NextResponse.redirect(googleAuthUrl);
}

// Google OAuth callback handler
export async function googleAuthCallbackHandler(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    return new NextResponse('Google OAuth not configured', { status: 500 });
  }
  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return new NextResponse('Missing code', { status: 400 });
  }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }).toString(),
  });
  if (!tokenRes.ok) {
    return new NextResponse('Failed to exchange token', { status: 500 });
  }
  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!userInfoRes.ok) {
    return new NextResponse('Failed to fetch user info', { status: 500 });
  }
  const profile = await userInfoRes.json();
  const googleId = profile.id as string;
  const email = profile.email as string;
  const name = profile.name as string;

  // Find or create user
  let user = await prisma.user.findUnique({ where: { googleId } });
  if (!user) {
    user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      // link googleId
      await prisma.user.update({ where: { id: user.id }, data: { googleId } });
    } else {
      // create new user (no password)
      user = await prisma.user.create({
        data: { email, name, googleId, passwordHash: '' },
      });
    }
  }

  // Create session
  const ip = request.headers.get('x-forwarded-for') || '';
  const { token } = await createSession(user.id, request.headers.get('user-agent') || undefined, ip);
  const res = NextResponse.redirect(new URL('/', request.url));
  setSessionCookie(res, token);
  return res;
}

// Activity feed
export async function activityHandler(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const limit = Number(request.nextUrl.searchParams.get('limit')) || 20;
  const logs = await prisma.log.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return NextResponse.json(logs);
}

// Workspace list
export async function listWorkspacesHandler(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const workspaces = await prisma.workspace.findMany({
    where: {
      OR: [
        { ownerId: session.userId },
        { memberships: { some: { userId: session.userId } } },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      owner: { select: { id: true, email: true, name: true } },
      _count: { select: { memberships: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(workspaces);
}

// Workspace create
export async function createWorkspaceHandler(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const body = await request.json();
  const { name, slug } = body;
  if (!name || !slug) return new NextResponse('name and slug required', { status: 400 });

  const existing = await prisma.workspace.findUnique({ where: { slug } });
  if (existing) return new NextResponse('Slug already taken', { status: 409 });

  const workspace = await prisma.workspace.create({
    data: { name, slug, ownerId: session.userId },
  });

  // Make owner an admin member
  await prisma.membership.create({
    data: { userId: session.userId, workspaceId: workspace.id, role: 'ADMIN' },
  });

  return NextResponse.json(workspace, { status: 201 });
}

export async function profileHandler(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return new NextResponse('Unauthenticated', { status: 401 });
  }

  if (request.method === 'GET') {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        photoUrl: true,
        secondaryEmail: true,
        phoneNumber: true,
        occupation: true,
      },
    });
    if (!user) return new NextResponse('User not found', { status: 404 });
    return NextResponse.json(user);
  }

  if (request.method === 'PATCH') {
    const body = await request.json();
    const schema = z.object({
      name: z.string().min(1).optional(),
      photoUrl: z.string().url().optional(),
      secondaryEmail: z.string().email().optional(),
      phoneNumber: z.string().optional(),
      occupation: z.string().optional(),
    });
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return new NextResponse('Invalid payload', { status: 400 });
    }
    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: parsed.data,
    });
    return NextResponse.json(updated);
  }

  return new NextResponse('Method not allowed', { status: 405 });
}
