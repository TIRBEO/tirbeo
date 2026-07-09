import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '../../../../lib/db/prisma';
import { verifyPassword } from '../../../../lib/auth/password';
import { createSession, setSessionCookie } from '../../../../lib/session';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) return new NextResponse('Invalid email or password', { status: 400 });

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(user.passwordHash, password))) {
      return new NextResponse('Invalid email or password', { status: 401 });
    }

    if (!user.adminRole) {
      return new NextResponse('Access denied. You do not have admin privileges.', { status: 403 });
    }

    if (user.is2FAEnabled) {
      const { signTemp2faToken } = await import('../../../../lib/auth/jwt');
      const tempToken = await signTemp2faToken(user.id);
      return NextResponse.json({ needs2FA: true, tempToken, userId: user.id });
    }

    const ip = request.headers.get('x-forwarded-for') || '';
    const { token } = await createSession(user.id, request.headers.get('user-agent') || undefined, ip);
    const res = NextResponse.json({ id: user.id, email: user.email, adminRole: user.adminRole });
    setSessionCookie(res, token);
    return res;
  } catch (err) {
    console.error('[ADMIN LOGIN]', err);
    return new NextResponse('Login failed', { status: 400 });
  }
}
