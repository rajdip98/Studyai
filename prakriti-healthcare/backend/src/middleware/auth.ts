import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/tokens";
import { AppError } from "./errorHandler";
import { ACCESS_COOKIE } from "../utils/response";

export interface AuthedRequest extends Request {
  user?: { id: string; role: "CUSTOMER" | "ADMIN" | "SUPPORT" };
}

export function requireAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const token = req.cookies?.[ACCESS_COOKIE];
  if (!token) {
    next(new AppError(401, "Authentication required", "UNAUTHENTICATED"));
    return;
  }
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new AppError(401, "Invalid or expired session", "UNAUTHENTICATED"));
  }
}

/** Populates req.user if a valid token is present, but never rejects. */
export function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const token = req.cookies?.[ACCESS_COOKIE];
  if (token) {
    try {
      const payload = verifyAccessToken(token);
      req.user = { id: payload.sub, role: payload.role };
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
}

export function requireRole(...roles: Array<"CUSTOMER" | "ADMIN" | "SUPPORT">) {
  return (req: AuthedRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new AppError(403, "Insufficient permissions", "FORBIDDEN"));
      return;
    }
    next();
  };
}
