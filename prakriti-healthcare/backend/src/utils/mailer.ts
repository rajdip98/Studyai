import nodemailer from "nodemailer";
import { env } from "../config/env";
import { logger } from "../config/logger";

const transporter = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ?? 587,
      secure: (env.SMTP_PORT ?? 587) === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
    })
  : null;

export async function sendMail(to: string, subject: string, html: string) {
  if (!transporter) {
    logger.warn({ to, subject }, "SMTP not configured — email not sent (dev no-op)");
    return;
  }
  await transporter.sendMail({ from: env.SMTP_FROM, to, subject, html });
}
