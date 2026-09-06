import { Router } from "express";
import client from "prom-client";
import { prisma } from "../../config/prisma";
import { redis } from "../../config/redis";

export const healthRouter = Router();

const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: "prakriti_" });

export const httpRequestDuration = new client.Histogram({
  name: "prakriti_http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});
register.registerMetric(httpRequestDuration);

// Liveness: process is up and can respond at all.
healthRouter.get("/live", (_req, res) => res.status(200).json({ status: "ok" }));

// Readiness: dependencies (DB, cache) are reachable — used by load balancers /
// orchestrators to decide whether to route traffic to this instance.
healthRouter.get("/ready", async (_req, res) => {
  const checks: Record<string, boolean> = {};
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch {
    checks.database = false;
  }
  try {
    checks.redis = (await redis.ping()) === "PONG";
  } catch {
    checks.redis = false;
  }

  const healthy = Object.values(checks).every(Boolean);
  res.status(healthy ? 200 : 503).json({ status: healthy ? "ok" : "degraded", checks });
});

// Prometheus scrape endpoint — should be network-restricted (not
// internet-facing) in production via ingress/network policy.
healthRouter.get("/metrics", async (_req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
});
