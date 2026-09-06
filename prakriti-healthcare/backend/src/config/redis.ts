import Redis from "ioredis";
import { env } from "./env";
import { logger } from "./logger";

// Redis backs: rate-limit counters, refresh-token-family reuse cache,
// session/cache invalidation, and idempotency keys for payments.
export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: false,
});

redis.on("error", (err) => logger.error({ err }, "Redis connection error"));
