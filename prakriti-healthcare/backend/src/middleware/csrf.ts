import type { NextFunction, Request, Response } from "express";
import crypto from "node:crypto";
import { isProd } from "../config/env";
import { AppError } from "./errorHandler";

const CSRF_COOKIE = "csrf_token";
const CSRF_HEADER = "x-csrf-token";

/**
 * Double-submit-cookie CSRF protection. Because auth tokens live in
 * httpOnly cookies (not readable by JS, and thus not attacker-exfiltratable
 * via XSS-read, but still auto-sent by the browser on cross-site requests),
 * every state-changing request must also echo a random token back as a
 * header — something only same-origin JS holding the non-httpOnly CSRF
 * cookie can do.
 */
export function issueCsrfToken(req: Request, res: Response, next: NextFunction) {
  if (!req.cookies?.[CSRF_COOKIE]) {
    const token = crypto.randomBytes(32).toString("hex");
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false,
      secure: isProd,
      sameSite: "strict",
      path: "/",
    });
  }
  next();
}

export function verifyCsrfToken(req: Request, _res: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    next();
    return;
  }
  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.header(CSRF_HEADER);
  if (!cookieToken || !headerToken || !safeEqual(cookieToken, headerToken)) {
    next(new AppError(403, "Invalid or missing CSRF token", "CSRF_FAILED"));
    return;
  }
  next();
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
