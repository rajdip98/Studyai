import type { Response } from "express";
import type { AuthedRequest } from "../../middleware/auth";
import { AppError } from "../../middleware/errorHandler";
import { setAuthCookies, clearAuthCookies, REFRESH_COOKIE } from "../../utils/response";
import { recordAudit } from "../../utils/audit";
import * as authService from "./auth.service";

export async function register(req: AuthedRequest, res: Response) {
  const { name, email, password } = req.body;
  const user = await authService.registerUser(name, email, password);
  await recordAudit(req, "USER_REGISTERED", { userId: user.id });
  res.status(201).json({
    message: "Account created. Please check your email to verify your account.",
    user: { id: user.id, name: user.name, email: user.email },
  });
}

export async function login(req: AuthedRequest, res: Response) {
  const { email, password, totpCode } = req.body;
  const result = await authService.loginUser(email, password, totpCode, {
    ip: req.ip,
    userAgent: req.header("user-agent"),
  });

  if (result.requires2fa) {
    res.status(200).json({ requires2fa: true });
    return;
  }

  setAuthCookies(res, result.accessToken, result.refreshToken);
  await recordAudit(req, "USER_LOGIN", { userId: result.userId });
  res.status(200).json({ user: { id: result.userId, role: result.role } });
}

export async function refresh(req: AuthedRequest, res: Response) {
  const rawToken = req.cookies?.[REFRESH_COOKIE];
  if (!rawToken) throw new AppError(401, "No session to refresh", "NO_SESSION");

  const result = await authService.rotateRefreshToken(rawToken, {
    ip: req.ip,
    userAgent: req.header("user-agent"),
  });
  setAuthCookies(res, result.accessToken, result.refreshToken);
  res.status(200).json({ user: { id: result.userId, role: result.role } });
}

export async function logout(req: AuthedRequest, res: Response) {
  const rawToken = req.cookies?.[REFRESH_COOKIE];
  if (rawToken) await authService.revokeRefreshToken(rawToken);
  clearAuthCookies(res);
  res.status(204).send();
}

export async function logoutAll(req: AuthedRequest, res: Response) {
  await authService.revokeAllSessions(req.user!.id);
  clearAuthCookies(res);
  await recordAudit(req, "USER_LOGOUT_ALL", { userId: req.user!.id });
  res.status(204).send();
}

export async function forgotPassword(req: AuthedRequest, res: Response) {
  await authService.requestPasswordReset(req.body.email);
  // Identical response whether or not the account exists.
  res.status(200).json({ message: "If that email is registered, a reset link has been sent." });
}

export async function resetPassword(req: AuthedRequest, res: Response) {
  await authService.resetPassword(req.body.token, req.body.password);
  await recordAudit(req, "PASSWORD_RESET");
  res.status(200).json({ message: "Password updated. Please log in again." });
}

export async function verifyEmail(req: AuthedRequest, res: Response) {
  await authService.verifyEmail(req.body.token);
  res.status(200).json({ message: "Email verified successfully." });
}

export async function start2fa(req: AuthedRequest, res: Response) {
  const { secret, otpauthUrl } = await authService.start2faEnrollment(req.user!.id);
  res.status(200).json({ secret, otpauthUrl });
}

export async function confirm2fa(req: AuthedRequest, res: Response) {
  await authService.confirm2faEnrollment(req.user!.id, req.body.totpCode);
  await recordAudit(req, "2FA_ENABLED", { userId: req.user!.id });
  res.status(200).json({ message: "Two-factor authentication enabled." });
}

export async function disable2fa(req: AuthedRequest, res: Response) {
  await authService.disable2fa(req.user!.id);
  await recordAudit(req, "2FA_DISABLED", { userId: req.user!.id });
  res.status(200).json({ message: "Two-factor authentication disabled." });
}

export async function me(req: AuthedRequest, res: Response) {
  res.status(200).json({ user: req.user });
}
