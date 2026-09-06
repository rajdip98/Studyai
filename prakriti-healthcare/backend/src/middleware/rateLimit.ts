import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../config/redis";
import type { Request } from "express";

// Distributed (Redis-backed) rate limiting so limits hold across multiple
// backend instances/containers, not just per-process memory.
function store(prefix: string) {
  return new RedisStore({
    prefix: `rl:${prefix}:`,
    sendCommand: (...args: string[]) => redis.call(...(args as [string, ...string[]])) as Promise<never>,
  });
}

const keyByIp = (req: Request) => req.ip ?? "unknown";

/** General API traffic: generous, protects against scraping/abuse. */
export const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  store: store("api"),
  keyGenerator: keyByIp,
});

/** Login/registration: tight limit to blunt credential-stuffing & brute force. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: store("auth"),
  keyGenerator: keyByIp,
  message: { error: "Too many attempts. Please try again later." },
});

/** Password reset / email token requests: prevents email-bombing & enumeration abuse. */
export const sensitiveActionLimiter = rateLimit({
  windowMs: 60 * 60_000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: store("sensitive"),
  keyGenerator: keyByIp,
});

/** Checkout/payment creation: prevents order/payment-intent flooding. */
export const paymentLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: store("payment"),
  keyGenerator: keyByIp,
});
