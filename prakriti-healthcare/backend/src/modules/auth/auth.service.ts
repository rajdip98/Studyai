import { nanoid } from "nanoid";
import { authenticator } from "otplib";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";
import { hashPassword, verifyPassword } from "../../utils/password";
import {
  generateOpaqueToken,
  generateRefreshToken,
  hashToken,
  signAccessToken,
  verifyAccessToken,
} from "../../utils/tokens";
import { env } from "../../config/env";
import { sendMail } from "../../utils/mailer";

const MAX_FAILED_LOGINS = 8;
const LOCKOUT_MINUTES = 15;

export async function registerUser(name: string, email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(409, "An account with this email already exists", "EMAIL_TAKEN");
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  const { token, hash } = generateOpaqueToken();
  await prisma.emailToken.create({
    data: {
      userId: user.id,
      tokenHash: hash,
      type: "VERIFY_EMAIL",
      expiresAt: new Date(Date.now() + env.EMAIL_TOKEN_TTL_MIN * 60_000),
    },
  });

  const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;
  await sendMail(
    user.email,
    "Verify your Prakriti Healthcare account",
    `<p>Welcome to Prakriti Healthcare. Verify your email (link valid ${env.EMAIL_TOKEN_TTL_MIN} minutes):</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
  );

  return user;
}

interface LoginResult {
  userId: string;
  role: "CUSTOMER" | "ADMIN" | "SUPPORT";
  accessToken: string;
  refreshToken: string;
  requires2fa?: boolean;
}

export async function loginUser(
  email: string,
  password: string,
  totpCode: string | undefined,
  meta: { ip?: string; userAgent?: string },
): Promise<LoginResult> {
  const user = await prisma.user.findUnique({ where: { email } });

  // Constant-shape response whether or not the user exists, to avoid
  // account enumeration via response-time/content differences.
  const genericError = () => new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");

  if (!user) {
    await verifyPassword(
      "$argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHQAAAAAAAAAAA$Ks4yfL6+3v2FQpS7ZQwZ3adYFhk2n8yj7YQeQKxJqQY",
      password,
    ).catch(() => undefined);
    throw genericError();
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new AppError(423, "Account temporarily locked due to failed login attempts", "ACCOUNT_LOCKED");
  }

  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) {
    const failedLoginCount = user.failedLoginCount + 1;
    const lockedUntil =
      failedLoginCount >= MAX_FAILED_LOGINS ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000) : null;
    await prisma.user.update({ where: { id: user.id }, data: { failedLoginCount, lockedUntil } });
    throw genericError();
  }

  if (user.totpEnabled) {
    if (!totpCode) {
      return { userId: user.id, role: user.role, accessToken: "", refreshToken: "", requires2fa: true };
    }
    const validTotp = authenticator.check(totpCode, user.totpSecret!);
    if (!validTotp) throw new AppError(401, "Invalid two-factor code", "INVALID_2FA");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginCount: 0, lockedUntil: null },
  });

  const { accessToken, refreshToken } = await issueSession(user.id, user.role, meta);
  return { userId: user.id, role: user.role, accessToken, refreshToken };
}

async function issueSession(
  userId: string,
  role: "CUSTOMER" | "ADMIN" | "SUPPORT",
  meta: { ip?: string; userAgent?: string },
  family: string = nanoid(),
) {
  const accessToken = signAccessToken({ sub: userId, role });
  const { token: refreshToken, hash } = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hash,
      family,
      ip: meta.ip,
      userAgent: meta.userAgent,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60_000),
    },
  });

  return { accessToken, refreshToken };
}

/**
 * Rotates the refresh token on every use and detects token reuse (a strong
 * signal of theft): if a token that was already rotated-away is presented
 * again, the entire token family is revoked, forcing re-authentication
 * everywhere.
 */
export async function rotateRefreshToken(rawToken: string, meta: { ip?: string; userAgent?: string }) {
  const tokenHash = hashToken(rawToken);
  const record = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!record || record.expiresAt < new Date()) {
    throw new AppError(401, "Session expired, please log in again", "SESSION_EXPIRED");
  }

  if (record.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { family: record.family, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw new AppError(401, "Session invalidated due to suspicious activity", "TOKEN_REUSE_DETECTED");
  }

  const user = await prisma.user.findUnique({ where: { id: record.userId } });
  if (!user) throw new AppError(401, "Session expired, please log in again", "SESSION_EXPIRED");

  const { accessToken, refreshToken } = await issueSession(user.id, user.role, meta, record.family);

  await prisma.refreshToken.update({
    where: { id: record.id },
    data: { revokedAt: new Date(), replacedBy: hashToken(refreshToken) },
  });

  return { accessToken, refreshToken, userId: user.id, role: user.role };
}

export async function revokeRefreshToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAllSessions(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Always behave the same regardless of whether the account exists.
  if (!user) return;

  const { token, hash } = generateOpaqueToken();
  await prisma.emailToken.create({
    data: {
      userId: user.id,
      tokenHash: hash,
      type: "RESET_PASSWORD",
      expiresAt: new Date(Date.now() + env.EMAIL_TOKEN_TTL_MIN * 60_000),
    },
  });

  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;
  await sendMail(
    user.email,
    "Reset your Prakriti Healthcare password",
    `<p>Use this link to reset your password (valid ${env.EMAIL_TOKEN_TTL_MIN} minutes):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, you can ignore this email.</p>`,
  );
}

export async function resetPassword(rawToken: string, newPassword: string) {
  const tokenHash = hashToken(rawToken);
  const record = await prisma.emailToken.findUnique({ where: { tokenHash } });

  if (!record || record.type !== "RESET_PASSWORD" || record.usedAt || record.expiresAt < new Date()) {
    throw new AppError(400, "Invalid or expired reset token", "INVALID_TOKEN");
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash, passwordUpdatedAt: new Date(), failedLoginCount: 0, lockedUntil: null },
    }),
    prisma.emailToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}

export async function verifyEmail(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  const record = await prisma.emailToken.findUnique({ where: { tokenHash } });

  if (!record || record.type !== "VERIFY_EMAIL" || record.usedAt || record.expiresAt < new Date()) {
    throw new AppError(400, "Invalid or expired verification token", "INVALID_TOKEN");
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } }),
    prisma.emailToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);
}

export async function start2faEnrollment(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found", "USER_NOT_FOUND");
  const secret = authenticator.generateSecret();
  await prisma.user.update({ where: { id: userId }, data: { totpSecret: secret, totpEnabled: false } });
  const otpauthUrl = authenticator.keyuri(user.email, "Prakriti Healthcare", secret);
  return { secret, otpauthUrl };
}

export async function confirm2faEnrollment(userId: string, code: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.totpSecret) throw new AppError(400, "2FA enrollment not started", "NO_2FA_ENROLLMENT");
  const valid = authenticator.check(code, user.totpSecret);
  if (!valid) throw new AppError(401, "Invalid two-factor code", "INVALID_2FA");
  await prisma.user.update({ where: { id: userId }, data: { totpEnabled: true } });
}

export async function disable2fa(userId: string) {
  await prisma.user.update({ where: { id: userId }, data: { totpEnabled: false, totpSecret: null } });
}

export function decodeAccessTokenSafe(token: string) {
  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}
