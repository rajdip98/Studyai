import type { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import hpp from "hpp";
import compression from "compression";
import cookieParser from "cookie-parser";
import express from "express";
import { corsOrigins, env, isProd } from "../config/env";
import { logger } from "../config/logger";

/**
 * Applies the baseline hardening stack. Order matters: helmet headers first,
 * then CORS (deny-by-default allowlist), then body parsers with strict size
 * limits, then HTTP parameter pollution guard.
 */
export function applyBaselineSecurity(app: Express) {
  app.disable("x-powered-by");
  app.set("trust proxy", 1); // required for correct req.ip behind a load balancer/CDN

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          imgSrc: ["'self'", "data:", env.CDN_BASE_URL ?? ""].filter(Boolean),
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: isProd ? [] : null,
        },
      },
      crossOriginResourcePolicy: { policy: "same-site" },
      crossOriginOpenerPolicy: { policy: "same-origin" },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      hsts: isProd ? { maxAge: 63072000, includeSubDomains: true, preload: true } : false,
    }),
  );

  app.use(
    cors({
      origin(origin, callback) {
        // Allow same-origin/non-browser requests (no Origin header, e.g. curl,
        // mobile apps, health checks) but enforce a strict allowlist for
        // browser requests.
        if (!origin || corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        logger.warn({ origin }, "Blocked CORS request from disallowed origin");
        callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "X-Idempotency-Key"],
      maxAge: 600,
    }),
  );

  app.use(compression());

  // Strict body size limits mitigate payload-based DoS.
  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: false, limit: "100kb" }));
  app.use(cookieParser(env.COOKIE_SECRET));

  // Prevents HTTP Parameter Pollution (?role=customer&role=admin style attacks).
  app.use(hpp());
}
