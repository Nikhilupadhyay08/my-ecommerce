import nodemailer from "nodemailer";
import type { SmtpSettings } from "@/lib/siteSettings";

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function sendMailWithSettings(
  settings: SmtpSettings,
  options: { to: string; subject: string; html: string; text?: string }
): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    ...(settings.user && settings.pass
      ? { auth: { user: settings.user, pass: settings.pass } }
      : {}),
  });

  await transporter.sendMail({
    from: `"${settings.fromName}" <${settings.from}>`,
    to: options.to,
    subject: options.subject,
    text: options.text ?? stripHtml(options.html),
    html: options.html,
  });
}
