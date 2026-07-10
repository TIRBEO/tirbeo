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
    console.log(`[SIGNUP OTP] No RESEND_API_KEY set. Code for ${email}: ${code}`);
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
        from: 'Tirbeo <onboarding@resend.dev>',
        to: [email],
        subject: 'Your Tirbeo verification code',
        html: `<div style="background:#09090b;color:#fafafa;font-family:Inter,system-ui,sans-serif;padding:48px 24px;text-align:center;max-width:480px;margin:0 auto">
          <div style="font-size:13px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#52525b;margin-bottom:32px">Tirbeo</div>
          <p style="color:#a1a1aa;font-size:14px;margin:0 0 8px">Your verification code</p>
          <div style="font-size:48px;font-weight:700;letter-spacing:8px;margin:20px 0;color:#fafafa;background:rgba(255,255,255,0.06);padding:16px 24px;border-radius:12px;display:inline-block">${code}</div>
          <p style="color:#52525b;font-size:13px;margin:28px 0 0">This code expires in 10 minutes.</p>
          <p style="color:#52525b;font-size:12px;margin:16px 0 0">If you didn't request this, you can safely ignore this email.</p>
        </div>`,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error(`[SIGNUP OTP] Resend API error ${res.status}: ${errText}`);
      console.log(`[SIGNUP OTP] Fallback: Code for ${email} is ${code}`);
    }
  } catch (err) {
    console.error(`[SIGNUP OTP] Network error sending to ${email}:`, err);
    console.log(`[SIGNUP OTP] Fallback: Code for ${email} is ${code}`);
  }
}
