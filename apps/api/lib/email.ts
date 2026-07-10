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
    result = result.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), val);
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

// ─── Built-in fallback templates (used when DB templates aren't seeded yet) ───

const FALLBACK_TEMPLATES: Record<string, { subject: string; html: string }> = {
  signup_otp: {
    subject: 'Your Tirbeo verification code',
    html: `<div style="background:#0B0B0D;color:#F2EEE8;font-family:Inter,system-ui,sans-serif;padding:48px 24px;text-align:center;max-width:480px;margin:0 auto;border-radius:16px">
      <div style="font-size:13px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#7B7E84;margin-bottom:32px">Tirbeo</div>
      <p style="color:#A6A6A6;font-size:14px;margin:0 0 8px">Your verification code</p>
      <div style="font-size:48px;font-weight:700;letter-spacing:8px;margin:20px 0;color:#F2EEE8;background:rgba(255,255,255,0.06);padding:16px 24px;border-radius:12px;display:inline-block;border:1px solid rgba(255,255,255,0.08)">{{otp}}</div>
      <p style="color:#7B7E84;font-size:13px;margin:28px 0 0">This code expires in 10 minutes.</p>
      <p style="color:#7B7E84;font-size:12px;margin:16px 0 0">If you didn't request this, you can safely ignore this email.</p>
    </div>`,
  },
  login_otp: {
    subject: 'Your Tirbeo login code',
    html: `<div style="background:#0B0B0D;color:#F2EEE8;font-family:Inter,system-ui,sans-serif;padding:48px 24px;text-align:center;max-width:480px;margin:0 auto;border-radius:16px">
      <div style="font-size:13px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#7B7E84;margin-bottom:32px">Tirbeo</div>
      <p style="color:#A6A6A6;font-size:14px;margin:0 0 8px">Your login code</p>
      <div style="font-size:48px;font-weight:700;letter-spacing:8px;margin:20px 0;color:#F2EEE8;background:rgba(255,255,255,0.06);padding:16px 24px;border-radius:12px;display:inline-block;border:1px solid rgba(255,255,255,0.08)">{{otp}}</div>
      <p style="color:#7B7E84;font-size:13px;margin:28px 0 0">This code expires in 10 minutes.</p>
      <p style="color:#7B7E84;font-size:12px;margin:16px 0 0">If you didn't request this, you can safely ignore this email.</p>
    </div>`,
  },
  welcome: {
    subject: 'Welcome to Tirbeo',
    html: `<div style="background:#0B0B0D;color:#F2EEE8;font-family:Inter,system-ui,sans-serif;padding:48px 24px;text-align:center;max-width:480px;margin:0 auto;border-radius:16px">
      <div style="font-size:13px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#7B7E84;margin-bottom:32px">Tirbeo</div>
      <h1 style="font-size:24px;font-weight:700;margin:0 0 16px;color:#F2EEE8">Welcome aboard!</h1>
      <p style="color:#A6A6A6;font-size:14px;margin:0 0 24px">Your account has been created. Start exploring Tirbeo today.</p>
      <a href="https://dashboard.tirbeo.app" style="display:inline-block;background:#D8B36A;color:#0B0B0D;font-weight:600;font-size:14px;padding:12px 32px;border-radius:8px;text-decoration:none">Go to Dashboard</a>
    </div>`,
  },
  password_reset: {
    subject: 'Reset your Tirbeo password',
    html: `<div style="background:#0B0B0D;color:#F2EEE8;font-family:Inter,system-ui,sans-serif;padding:48px 24px;text-align:center;max-width:480px;margin:0 auto;border-radius:16px">
      <div style="font-size:13px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#7B7E84;margin-bottom:32px">Tirbeo</div>
      <h1 style="font-size:24px;font-weight:700;margin:0 0 16px;color:#F2EEE8">Password Reset</h1>
      <p style="color:#A6A6A6;font-size:14px;margin:0 0 8px">Use the code below to reset your password:</p>
      <div style="font-size:48px;font-weight:700;letter-spacing:8px;margin:20px 0;color:#F2EEE8;background:rgba(255,255,255,0.06);padding:16px 24px;border-radius:12px;display:inline-block;border:1px solid rgba(255,255,255,0.08)">{{otp}}</div>
      <p style="color:#7B7E84;font-size:13px;margin:28px 0 0">This code expires in 10 minutes.</p>
      <p style="color:#7B7E84;font-size:12px;margin:16px 0 0">If you didn't request this, you can safely ignore this email.</p>
    </div>`,
  },
  email_verify: {
    subject: 'Verify your Tirbeo email',
    html: `<div style="background:#0B0B0D;color:#F2EEE8;font-family:Inter,system-ui,sans-serif;padding:48px 24px;text-align:center;max-width:480px;margin:0 auto;border-radius:16px">
      <div style="font-size:13px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#7B7E84;margin-bottom:32px">Tirbeo</div>
      <h1 style="font-size:24px;font-weight:700;margin:0 0 16px;color:#F2EEE8">Verify your email</h1>
      <p style="color:#A6A6A6;font-size:14px;margin:0 0 8px">Your verification code:</p>
      <div style="font-size:48px;font-weight:700;letter-spacing:8px;margin:20px 0;color:#F2EEE8;background:rgba(255,255,255,0.06);padding:16px 24px;border-radius:12px;display:inline-block;border:1px solid rgba(255,255,255,0.08)">{{otp}}</div>
      <p style="color:#7B7E84;font-size:13px;margin:28px 0 0">This code expires in 10 minutes.</p>
    </div>`,
  },
};

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

  const fallback = FALLBACK_TEMPLATES[templateName];
  if (fallback) {
    console.log(`[EMAIL] Template '${templateName}' not in DB, using built-in fallback`);
    const subject = renderTemplate(fallback.subject, variables);
    const htmlBody = renderTemplate(fallback.html, variables);
    return sendEmail(to, subject, htmlBody, options);
  }

  return { success: false, error: `Template '${templateName}' not found` };
}

export { FALLBACK_TEMPLATES };
