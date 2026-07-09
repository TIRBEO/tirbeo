import { prisma } from '../db/prisma';
import { hashPassword as hashOtp, verifyPassword as verifyOtp } from './password';
import { addMinutes } from 'date-fns';

const OTP_TTL_MINUTES = 10;

export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function storeSignupOtp(email: string, code: string) {
  const otpHash = await hashOtp(code);
  const expiresAt = addMinutes(new Date(), OTP_TTL_MINUTES);
  await prisma.signupOtp.create({
    data: { email: email.toLowerCase(), otpHash, expiresAt },
  });
}

export async function verifySignupOtp(email: string, code: string): Promise<boolean> {
  const otp = await prisma.signupOtp.findFirst({
    where: { email: email.toLowerCase() },
    orderBy: { createdAt: 'desc' },
  });
  if (!otp) return false;
  if (otp.expiresAt < new Date()) {
    await prisma.signupOtp.delete({ where: { id: otp.id } });
    return false;
  }
  const ok = await verifyOtp(otp.otpHash, code);
  if (ok) {
    await prisma.signupOtp.delete({ where: { id: otp.id } });
  }
  return ok;
}

export async function sendSignupOtpEmail(email: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[SIGNUP OTP] No RESEND_API_KEY. Would send code ${code} to ${email}`);
    return;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Tirbeo <noreply@tirbeo.app>',
        to: [email],
        subject: 'Your verification code',
        html: `<div style="background:#000;color:#fff;font-family:Inter,sans-serif;padding:48px 24px;text-align:center">
          <h1 style="font-size:24px;font-weight:300;letter-spacing:-0.03em;margin:0 0 24px">Tirbeo</h1>
          <p style="color:#94A3B8;font-size:14px;margin:0 0 8px">Your verification code</p>
          <div style="font-size:48px;font-weight:700;letter-spacing:8px;margin:16px 0;color:#F2EEE8">${code}</div>
          <p style="color:#94A3B8;font-size:13px;margin:24px 0 0">This code expires in 10 minutes.</p>
        </div>`,
      }),
    });
    if (!res.ok) console.error(`[SIGNUP OTP] Resend error ${res.status}: ${await res.text()}`);
  } catch (err) {
    console.error(`[SIGNUP OTP] Failed to send to ${email}:`, err);
    throw err;
  }
}
