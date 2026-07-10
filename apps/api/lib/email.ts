import nodemailer from 'nodemailer';
import { prisma } from './db/prisma';

interface EmailResult { success: boolean; error?: string; messageId?: string; }

export async function getEmailConfig() {
  return prisma.emailConfig.findFirst({ orderBy: { updatedAt: 'desc' } });
}

export async function getEmailTemplate(name: string) {
  return prisma.emailTemplate.findUnique({ where: { name } });
}

export function renderTemplate(html: string, vars: Record<string, string>): string {
  let result = html;
  for (const [key, val] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi'), val);
  }
  return result;
}

export async function sendEmail(
  to: string,
  subject: string,
  htmlBody: string,
  options?: { fromEmail?: string; fromName?: string }
): Promise<EmailResult> {
  let config: any = null;
  try {
    config = await getEmailConfig();
  } catch (e: any) {
    console.warn('[EMAIL] Failed to load config from DB:', e?.message);
  }

  const apiKey = config?.apiKey || process.env.RESEND_API_KEY || '';
  const provider = config?.provider || 'resend';
  const enabled = config?.enabled !== false;

  if (!apiKey) {
    console.error(`[EMAIL] No API key configured. Cannot send to ${to}: ${subject}`);
    return { success: false, error: 'No email API key configured' };
  }

  if (!enabled && config) {
    console.log(`[EMAIL] Config disabled. Would send to ${to}: ${subject}`);
    return { success: true, messageId: 'noop' };
  }

  const fromEmail = options?.fromEmail || config?.fromEmail || 'noreply@tirbeo.app';
  const fromName = options?.fromName || config?.fromName || 'Tirbeo';

  if (provider === 'resend' || (!config && apiKey)) {
    return sendViaResend(apiKey, to, fromEmail, fromName, subject, htmlBody);
  } else if (provider === 'smtp') {
    return sendViaSmtp(config, to, fromEmail, fromName, subject, htmlBody);
  }

  console.error(`[EMAIL] Unknown provider "${provider}". Cannot send to ${to}`);
  return { success: false, error: `Unknown email provider: ${provider}` };
}

async function sendViaResend(apiKey: string, to: string, fromEmail: string, fromName: string, subject: string, html: string): Promise<EmailResult> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
        to: [to],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `Resend error ${res.status}: ${err}` };
    }
    const data = await res.json();
    return { success: true, messageId: data.id };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

async function sendViaSmtp(
  config: { smtpHost: string; smtpPort: number; smtpUser: string; smtpPass: string },
  to: string, fromEmail: string, fromName: string, subject: string, html: string
): Promise<EmailResult> {
  try {
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: { user: config.smtpUser, pass: config.smtpPass },
    });
    const info = await transporter.sendMail({
      from: fromName ? `"${fromName}" <${fromEmail}>` : fromEmail,
      to,
      subject,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

// ─── Fallback templates using user's exact designs + configurable logo ───

export function getLogoUrl(): string {
  return process.env.TIRBEO_LOGO_URL || 'https://ipdwpivjwwaawelmczas.supabase.co/storage/v1/object/sign/TIRBEO/logo1.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80OGIyNGYwYS0yZWM2LTQ1NjUtODZhNi00YzE5YWQ4YmM5ZWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJUSVJCRU8vbG9nbzEucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MzcxNjkzNSwiZXhwIjozMTU1MzUyMTgwOTM1fQ.dkcUfeeys77uB98553a7O9lXTM_9j9TUGkKJkIb__Bs';
}

function buildFallbackTemplates(): Record<string, { subject: string; html: string }> {
  const LOGO = getLogoUrl();
  return {
    signup_otp: {
      subject: 'Your Tirbeo verification code is {{otp}}',
      html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Verify Your Email</title></head><body style="margin:0;padding:0;background:#08150F;font-family:Inter,Segoe UI,Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#08150F;padding:50px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#12271D;border:1px solid rgba(255,255,255,.08);border-radius:24px;overflow:hidden;"><tr><td style="background:linear-gradient(135deg,#022B22,#275D46,#569578);padding:45px 40px;text-align:center;"><img src="${LOGO}" width="48" alt="Tirbeo" style="margin-bottom:18px;"><h1 style="margin:0;font-size:32px;font-weight:700;color:#ffffff;">Verify your email</h1><p style="margin:14px 0 0;font-size:16px;line-height:26px;color:rgba(255,255,255,.85);">Complete your account setup securely.</p></td></tr><tr><td style="padding:45px;"><p style="margin:0;font-size:16px;line-height:28px;color:#B7C6BE;">Hello,</p><p style="margin:20px 0 35px;font-size:16px;line-height:28px;color:#B7C6BE;">Use the verification code below to activate your Tirbeo account. This code expires in <strong style="color:#ffffff;">10 minutes</strong>.</p><table width="100%" cellpadding="0" cellspacing="0" style="background:#101C13;border:1px solid #275D46;border-radius:18px;"><tr><td align="center" style="padding:30px;font-size:38px;font-weight:800;letter-spacing:12px;color:#ffffff;font-family:monospace;">{{OTP}}</td></tr></table><table style="margin-top:28px;background:#173124;border-radius:14px;" cellpadding="12"><tr><td style="font-size:18px;"></td><td style="color:#B7C6BE;font-size:14px;line-height:22px;">This verification code is private. Never share it with anyone.</td></tr></table><div style="margin:35px 0;height:1px;background:rgba(255,255,255,.08);"></div><p style="margin:0;font-size:15px;line-height:26px;color:#8DA39A;">If you didn't create a Tirbeo account, you can safely ignore this email.</p></td></tr><tr><td style="padding:30px;background:#101C13;text-align:center;"><p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;">Tirbeo</p><p style="margin:10px 0 0;font-size:13px;color:#8DA39A;line-height:22px;">Thank You</p><p style="margin-top:24px;font-size:12px;color:#6E8078;">© 2026 Tirbeo. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`,
    },
    login_otp: {
      subject: 'Your Tirbeo login code is {{otp}}',
      html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Your Login Code</title></head><body style="margin:0;padding:0;background:#08150F;font-family:Inter,Segoe UI,Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#08150F;padding:50px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#12271D;border:1px solid rgba(255,255,255,.08);border-radius:24px;overflow:hidden;"><tr><td style="background:linear-gradient(135deg,#022B22,#275D46,#569578);padding:45px 40px;text-align:center;"><img src="${LOGO}" width="48" alt="Tirbeo" style="margin-bottom:18px;"><h1 style="margin:0;font-size:32px;font-weight:700;color:#ffffff;">Your login code</h1><p style="margin:14px 0 0;font-size:16px;line-height:26px;color:rgba(255,255,255,.85);">Use this code to sign in to your account.</p></td></tr><tr><td style="padding:45px;"><p style="margin:0;font-size:16px;line-height:28px;color:#B7C6BE;">Hello,</p><p style="margin:20px 0 35px;font-size:16px;line-height:28px;color:#B7C6BE;">Here is your login verification code. It expires in <strong style="color:#ffffff;">10 minutes</strong>.</p><table width="100%" cellpadding="0" cellspacing="0" style="background:#101C13;border:1px solid #275D46;border-radius:18px;"><tr><td align="center" style="padding:30px;font-size:38px;font-weight:800;letter-spacing:12px;color:#ffffff;font-family:monospace;">{{OTP}}</td></tr></table><table style="margin-top:28px;background:#173124;border-radius:14px;" cellpadding="12"><tr><td style="font-size:18px;"></td><td style="color:#B7C6BE;font-size:14px;line-height:22px;">This code is private. Never share it with anyone.</td></tr></table><div style="margin:35px 0;height:1px;background:rgba(255,255,255,.08);"></div><p style="margin:0;font-size:15px;line-height:26px;color:#8DA39A;">If you didn't request this login, you can safely ignore this email.</p></td></tr><tr><td style="padding:30px;background:#101C13;text-align:center;"><p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;">Tirbeo</p><p style="margin:10px 0 0;font-size:13px;color:#8DA39A;">Premium Workspace Platform</p><p style="margin-top:22px;font-size:12px;color:#6E8078;">© 2026 Tirbeo. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`,
    },
    welcome: {
      subject: 'Welcome to Tirbeo, {{name}}!',
      html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Welcome to Tirbeo</title></head><body style="margin:0;padding:0;background:#08150F;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#08150F;padding:50px 20px;"><tr><td align="center"><table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#12271D;border:1px solid #214434;border-radius:24px;overflow:hidden;"><tr><td align="center" style="padding:56px 40px;background:linear-gradient(135deg,#022B22,#275D46,#569578);"><img src="${LOGO}" width="60" alt="Tirbeo" style="display:block;margin:0 auto 20px;"><h1 style="margin:0;color:#FFFFFF;font-size:34px;font-weight:700;">Welcome to Tirbeo</h1><p style="margin:18px 0 0;color:rgba(255,255,255,.88);font-size:17px;line-height:30px;">Your workspace is ready. Let's build something amazing together.</p></td></tr><tr><td style="padding:48px;"><p style="margin:0;color:#FFFFFF;font-size:20px;font-weight:600;">Hi {{name}} 👋</p><p style="margin:22px 0;color:#B7C6BE;font-size:16px;line-height:30px;">Thanks for joining <strong style="color:#FFFFFF;">Tirbeo</strong>. Your account has been created successfully and you're ready to start exploring everything our platform has to offer.</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:18px;background:#101C13;border:1px solid #214434;border-radius:16px;"><p style="margin:0;font-size:15px;color:#FFFFFF;font-weight:600;">🚀 Explore Communities</p><p style="margin:10px 0 0;color:#B7C6BE;font-size:14px;line-height:24px;">Discover discussions and connect with people who share your interests.</p></td></tr><tr><td height="16"></td></tr><tr><td style="padding:18px;background:#101C13;border:1px solid #214434;border-radius:16px;"><p style="margin:0;font-size:15px;color:#FFFFFF;font-weight:600;">💬 Join Conversations</p><p style="margin:10px 0 0;color:#B7C6BE;font-size:14px;line-height:24px;">Share ideas, ask questions, and collaborate with your community.</p></td></tr><tr><td height="16"></td></tr><tr><td style="padding:18px;background:#101C13;border:1px solid #214434;border-radius:16px;"><p style="margin:0;font-size:15px;color:#FFFFFF;font-weight:600;">🌱 Grow Your Network</p><p style="margin:10px 0 0;color:#B7C6BE;font-size:14px;line-height:24px;">Follow people, discover creators, and build meaningful connections.</p></td></tr></table><table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:38px auto 0;"><tr><td bgcolor="#275D46" style="border-radius:999px;"><a href="https://dashboard.tirbeo.app" style="display:inline-block;padding:16px 34px;background:linear-gradient(135deg,#275D46,#569578);color:#FFFFFF;text-decoration:none;font-size:16px;font-weight:600;border-radius:999px;">Open Tirbeo →</a></td></tr></table><div style="margin-top:40px;padding:20px;background:#173124;border-left:4px solid #569578;border-radius:14px;"><strong style="color:#FFFFFF;font-size:15px;">Need help?</strong><p style="margin:10px 0 0;color:#B7C6BE;font-size:14px;line-height:24px;">If you have any questions, simply reply to this email. Our team is always happy to help.</p></div></td></tr><tr><td align="center" style="padding:30px;background:#101C13;border-top:1px solid #214434;"><p style="margin:0;color:#FFFFFF;font-size:16px;font-weight:600;">Tirbeo</p><p style="margin:10px 0 0;color:#8DA39A;font-size:13px;">Build communities. Share ideas. Grow together.</p><p style="margin-top:22px;color:#6E8078;font-size:12px;">© 2026 Tirbeo. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`,
    },
    password_reset: {
      subject: 'Reset your Tirbeo password',
      html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Reset Your Password</title></head><body style="margin:0;padding:0;background:#08150F;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#08150F;padding:50px 20px;"><tr><td align="center"><table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#12271D;border:1px solid #214434;border-radius:24px;overflow:hidden;"><tr><td align="center" style="padding:48px;background:linear-gradient(135deg,#022B22,#275D46,#569578);"><img src="${LOGO}" width="56" alt="Tirbeo" style="display:block;margin:0 auto 18px;"><h1 style="margin:0;font-size:32px;font-weight:700;color:#FFFFFF;">Reset your password</h1><p style="margin:14px 0 0;color:rgba(255,255,255,.85);font-size:16px;line-height:28px;">Secure access to your Tirbeo workspace.</p></td></tr><tr><td style="padding:48px;"><p style="margin:0;font-size:16px;line-height:28px;color:#B7C6BE;">We received a request to reset the password for your Tirbeo account.</p><p style="margin:24px 0 36px;font-size:16px;line-height:28px;color:#B7C6BE;">Use the code below to reset your password. This code expires in <strong style="color:#FFFFFF;">10 minutes</strong>.</p><table width="100%" cellpadding="0" cellspacing="0" style="background:#101C13;border:1px solid #275D46;border-radius:18px;"><tr><td align="center" style="padding:30px;font-size:38px;font-weight:800;letter-spacing:12px;color:#ffffff;font-family:monospace;">{{OTP}}</td></tr></table><div style="margin-top:28px;background:#173124;border-left:4px solid #569578;border-radius:12px;padding:18px;"><strong style="color:#FFFFFF;font-size:14px;">🔒 Didn't request this?</strong><p style="margin:8px 0 0;color:#B7C6BE;font-size:14px;line-height:24px;">If you didn't request a password reset, you can safely ignore this email. Your password won't change unless you use the code above.</p></div></td></tr><tr><td align="center" style="padding:30px;background:#101C13;border-top:1px solid #214434;"><p style="margin:0;color:#FFFFFF;font-size:16px;font-weight:600;">Tirbeo</p><p style="margin:10px 0 0;color:#8DA39A;font-size:13px;">Premium Workspace Platform</p><p style="margin-top:22px;color:#6E8078;font-size:12px;">© 2026 Tirbeo. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`,
    },
    email_verify: {
      subject: 'Verify your Tirbeo email',
      html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Verify Your Email</title></head><body style="margin:0;padding:0;background:#08150F;font-family:Inter,Segoe UI,Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#08150F;padding:50px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#12271D;border:1px solid rgba(255,255,255,.08);border-radius:24px;overflow:hidden;"><tr><td style="background:linear-gradient(135deg,#022B22,#275D46,#569578);padding:45px 40px;text-align:center;"><img src="${LOGO}" width="48" alt="Tirbeo" style="margin-bottom:18px;"><h1 style="margin:0;font-size:32px;font-weight:700;color:#ffffff;">Verify your email</h1><p style="margin:14px 0 0;font-size:16px;line-height:26px;color:rgba(255,255,255,.85);">Confirm your email address securely.</p></td></tr><tr><td style="padding:45px;"><p style="margin:0;font-size:16px;line-height:28px;color:#B7C6BE;">Your verification code:</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background:#101C13;border:1px solid #275D46;border-radius:18px;"><tr><td align="center" style="padding:30px;font-size:38px;font-weight:800;letter-spacing:12px;color:#ffffff;font-family:monospace;">{{OTP}}</td></tr></table><p style="margin:28px 0 0;font-size:15px;line-height:26px;color:#8DA39A;">This code expires in 10 minutes.</p></td></tr><tr><td style="padding:30px;background:#101C13;text-align:center;"><p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;">Tirbeo</p><p style="margin-top:22px;font-size:12px;color:#6E8078;">© 2026 Tirbeo. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`,
    },
  };
}

export async function sendTemplateEmail(
  to: string,
  templateName: string,
  variables: Record<string, string>,
  options?: { fromEmail?: string; fromName?: string }
): Promise<EmailResult> {
  const template = await getEmailTemplate(templateName);
  if (template) {
    const subject = renderTemplate(template.subject, variables);
    const htmlBody = renderTemplate(template.htmlBody, variables);
    return sendEmail(to, subject, htmlBody, {
      fromEmail: options?.fromEmail || template.fromEmail || undefined,
      fromName: options?.fromName || template.fromName || undefined,
    });
  }

  const fallbacks = buildFallbackTemplates();
  const fallback = fallbacks[templateName];
  if (fallback) {
    console.log(`[EMAIL] Template '${templateName}' not in DB, using built-in fallback`);
    const subject = renderTemplate(fallback.subject, variables);
    const htmlBody = renderTemplate(fallback.html, variables);
    return sendEmail(to, subject, htmlBody, options);
  }

  return { success: false, error: `Template '${templateName}' not found` };
}

export function getFallbackTemplates(): Record<string, { subject: string; html: string }> {
  return buildFallbackTemplates();
}
