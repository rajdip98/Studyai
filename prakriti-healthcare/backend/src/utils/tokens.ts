import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from "../config/env";

export interface AccessTokenPayload {
  sub: string; // user id
  role: "CUSTOMER" | "ADMIN" | "SUPPORT";
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL as jwt.SignOptions["expiresIn"],
    issuer: "prakriti-healthcare",
    audience: "prakriti-healthcare-web",
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: "prakriti-healthcare",
    audience: "prakriti-healthcare-web",
  }) as AccessTokenPayload;
}

/**
 * Refresh tokens are opaque random strings, never JWTs — the server is the
 * only party that needs to introspect them, and storing only a SHA-256 hash
 * in the database means a database leak alone cannot be used to mint valid
 * sessions.
 */
export function generateRefreshToken(): { token: string; hash: string } {
  const token = crypto.randomBytes(48).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateOpaqueToken(): { token: string; hash: string } {
  const token = crypto.randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}
