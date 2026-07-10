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
    if (!user) {
      return new NextResponse('Invalid email or password', { status: 401 });
    }
    if (!user.passwordHash) {
      return new NextResponse('This account uses social login. Please sign in with Google or GitHub.', { status: 401 });
    }
    if (!(await verifyPassword(user.passwordHash, password))) {
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
  } catch (err: any) {
    console.error('[LOGIN]', err?.message || err);
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
  } catch (err: any) {
    console.error('[LOGIN]', err?.message || err, err?.stack);
    return new NextResponse(`Login failed: ${err?.message || 'unknown'}`, { status: 400 });
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
    let emailSent = false;
    try {
      const result = await sendSignupOtpEmail(email, code);
      emailSent = result.success;
    } catch (emailErr) {
      console.error('[SIGNUP OTP] Email send error:', emailErr);
    }
    const resp: any = { message: 'Verification code sent to email' };
    if (!emailSent) {
      resp.devCode = code;
      resp.devMessage = 'Email delivery failed — use this code for testing';
      console.log(`[SIGNUP OTP] Dev mode: code for ${email} is ${code}`);
    }
    return NextResponse.json(resp, { status: 200 });
  } catch (err: any) {
    console.error('[SIGNUP OTP REQUEST]', err?.message || err, err?.stack);
    return new NextResponse(`Failed to process request: ${err?.message || 'unknown'}`, { status: 500 });
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
    let emailSent = false;
    try {
      const result = await sendSignupOtpEmail(email, code);
      emailSent = result.success;
    } catch (emailErr) {
      console.error('[LOGIN OTP] Email send error:', emailErr);
    }
    const resp: any = { message: 'Verification code sent to your email' };
    if (!emailSent) {
      resp.devCode = code;
      resp.devMessage = 'Email delivery failed — use this code for testing';
      console.log(`[LOGIN OTP] Dev mode: code for ${email} is ${code}`);
    }
    return NextResponse.json(resp, { status: 200 });
  } catch (err: any) {
    console.error('[LOGIN OTP REQUEST]', err?.message || err, err?.stack);
    return new NextResponse(`Failed to process request: ${err?.message || 'unknown'}`, { status: 500 });
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
  const photoUrl = profile.picture as string | undefined;

  // Find or create user
  let user = await prisma.user.findUnique({ where: { googleId } });
  if (!user) {
    user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      // link googleId + update profile from OAuth
      await prisma.user.update({
        where: { id: user.id },
        data: { googleId, photoUrl: user.photoUrl || photoUrl || undefined },
      });
    } else {
      // create new user (no password needed for OAuth)
      const adminCount = await prisma.user.count({ where: { adminRole: { not: null } } });
      user = await prisma.user.create({
        data: {
          email, name, googleId, photoUrl: photoUrl || undefined,
          adminRole: adminCount === 0 ? 'super_admin' : undefined,
        },
      });
      // Log the new OAuth user creation
      await prisma.auditEvent.create({
        data: { actorId: user.id, action: 'user.created', targetType: 'user', targetId: user.id, metadata: { provider: 'google', email } },
      });
    }
  } else {
    // Existing OAuth user — refresh photo if not set
    if (!user.photoUrl && photoUrl) {
      await prisma.user.update({ where: { id: user.id }, data: { photoUrl } });
    }
  }

  // Create Integration record
  await prisma.integration.upsert({
    where: { userId_provider: { userId: user.id, provider: 'google' } },
    update: { connected: true, metadata: { googleId, email } },
    create: { userId: user.id, provider: 'google', connected: true, metadata: { googleId, email } },
  });

  // Create session
  const ip = request.headers.get('x-forwarded-for') || '';
  const { token } = await createSession(user.id, request.headers.get('user-agent') || undefined, ip);
  const res = NextResponse.redirect(`https://dashboard.${process.env.NEXT_PUBLIC_APP_DOMAIN || 'tirbeo.app'}`);
  setSessionCookie(res, token);
  return res;
}

// GitHub OAuth - start flow
export async function githubAuthRedirectHandler(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return new NextResponse('GitHub OAuth not configured', { status: 500 });
  }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read:user user:email',
  });
  const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
  return NextResponse.redirect(githubAuthUrl);
}

// GitHub OAuth callback handler
export async function githubAuthCallbackHandler(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const redirectUri = process.env.GITHUB_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    return new NextResponse('GitHub OAuth not configured', { status: 500 });
  }
  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return new NextResponse('Missing code', { status: 400 });
  }

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirectUri }),
  });
  if (!tokenRes.ok) {
    return new NextResponse('Failed to exchange token', { status: 500 });
  }
  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  const userInfoRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!userInfoRes.ok) {
    return new NextResponse('Failed to fetch user info', { status: 500 });
  }
  const profile = await userInfoRes.json();
  const githubId = String(profile.id);
  let email = profile.email;
  const name = profile.name || profile.login;
  const photoUrl = profile.avatar_url as string | undefined;

  if (!email) {
    const emailsRes = await fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (emailsRes.ok) {
      const emails = await emailsRes.json();
      const primary = emails.find((e: any) => e.primary) || emails[0];
      if (primary) email = primary.email;
    }
  }

  let user = await prisma.user.findUnique({ where: { githubId } });
  if (!user && email) {
    user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { githubId, photoUrl: user.photoUrl || photoUrl || undefined },
      });
    } else {
      const adminCount = await prisma.user.count({ where: { adminRole: { not: null } } });
      user = await prisma.user.create({
        data: {
          email: email || `${githubId}@github.user`, name, githubId,
          photoUrl: photoUrl || undefined,
          adminRole: adminCount === 0 ? 'super_admin' : undefined,
        },
      });
      await prisma.auditEvent.create({
        data: { actorId: user.id, action: 'user.created', targetType: 'user', targetId: user.id, metadata: { provider: 'github', email } },
      });
    }
  } else if (user) {
    // Existing OAuth user — refresh photo if not set
    if (!user.photoUrl && photoUrl) {
      await prisma.user.update({ where: { id: user.id }, data: { photoUrl } });
    }
  } else {
    return new NextResponse('GitHub email not available', { status: 400 });
  }

  // Create Integration record
  await prisma.integration.upsert({
    where: { userId_provider: { userId: user.id, provider: 'github' } },
    update: { connected: true, metadata: { githubId, email } },
    create: { userId: user.id, provider: 'github', connected: true, metadata: { githubId, email } },
  });

  const ip = request.headers.get('x-forwarded-for') || '';
  const { token } = await createSession(user.id, request.headers.get('user-agent') || undefined, ip);
  const res = NextResponse.redirect(`https://dashboard.${process.env.NEXT_PUBLIC_APP_DOMAIN || 'tirbeo.app'}`);
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
      photoUrl: z.string().optional().nullable(),
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
