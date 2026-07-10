import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me');
const COOKIE_NAME = '__session';

interface SessionPayload extends JWTPayload {
  sub: string;
  sid: string;
}

export async function signToken(userId: string, sessionId: string): Promise<string> {
  return new SignJWT({ sub: userId, sid: sessionId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, { algorithms: ['HS256'] });
    if (!payload.sub || !payload.sid) return null;
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function signTemp2faToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId, purpose: '2fa' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(SECRET);
}

export async function verifyTemp2faToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, { algorithms: ['HS256'] });
    if (payload.sub && payload.purpose === '2fa') return payload.sub as string;
    return null;
  } catch {
    return null;
  }
}

export async function signPasswordResetToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId, purpose: 'password-reset' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(SECRET);
}

export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, { algorithms: ['HS256'] });
    if (payload.sub && payload.purpose === 'password-reset') return payload.sub as string;
    return null;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
