import nodemailer from 'nodemailer';
import { prisma } from './db/prisma';

interface EmailResult { success: boolean; error?: string; messageId?: string; }

export async function getEmailConfig() {
  const cfg = await prisma.emailConfig.findFirst({ orderBy: { updatedAt: 'desc' } });
  return cfg;
}

export async function getEmailTemplate(name: string) {
  const tpl = await prisma.emailTemplate.findUnique({ where: { name } });
  return tpl;
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
  const config = await getEmailConfig();
  if (!config?.enabled) {
    console.log(`[EMAIL] Config disabled or missing. Would send to ${to}: ${subject}`);
    return { success: true, messageId: 'noop' };
  }

  const fromEmail = options?.fromEmail || config.fromEmail;
  const fromName = options?.fromName || config.fromName;

  if (config.provider === 'resend') {
    return sendViaResend(config.apiKey!, to, fromEmail, fromName, subject, htmlBody);
  } else if (config.provider === 'smtp') {
    return sendViaSmtp(config, to, fromEmail, fromName, subject, htmlBody);
  }
  console.log(`[EMAIL] No provider configured. Would send to ${to}: ${subject}`);
  return { success: true, messageId: 'noop' };
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

export async function sendTemplateEmail(
  to: string,
  templateName: string,
  variables: Record<string, string>,
  options?: { fromEmail?: string; fromName?: string }
): Promise<EmailResult> {
  const template = await getEmailTemplate(templateName);
  if (!template) {
    return { success: false, error: `Template '${templateName}' not found` };
  }
  const subject = renderTemplate(template.subject, variables);
  const htmlBody = renderTemplate(template.htmlBody, variables);
  return sendEmail(to, subject, htmlBody, {
    fromEmail: options?.fromEmail || template.fromEmail || undefined,
    fromName: options?.fromName || template.fromName || undefined,
  });
}
