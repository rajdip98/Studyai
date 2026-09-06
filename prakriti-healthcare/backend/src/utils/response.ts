import type { CookieOptions, Response } from "express";
import { isProd } from "../config/env";

// Auth tokens live in httpOnly, Secure, SameSite=strict cookies — never in
// localStorage/sessionStorage, which is directly readable by any injected
// script (the #1 way JWTs get stolen via XSS).
export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

const baseCookieOpts: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "strict",
  path: "/",
};

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie(ACCESS_COOKIE, accessToken, { ...baseCookieOpts, maxAge: 15 * 60_000 });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...baseCookieOpts,
    maxAge: 30 * 24 * 60 * 60_000,
    path: "/api/auth", // only sent to auth endpoints — narrows exposure
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE, { ...baseCookieOpts });
  res.clearCookie(REFRESH_COOKIE, { ...baseCookieOpts, path: "/api/auth" });
}
