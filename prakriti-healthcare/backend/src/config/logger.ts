import pino from "pino";
import { env, isProd } from "./env";

// Structured JSON logs in production (ingested by CloudWatch/Loki/Datadog),
// pretty-printed in development. Redact anything that could leak secrets or
// PII into log aggregators.
export const logger = pino({
  level: env.NODE_ENV === "test" ? "silent" : isProd ? "info" : "debug",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "*.password",
      "*.passwordHash",
      "*.token",
      "*.accessToken",
      "*.refreshToken",
      "*.totpSecret",
    ],
    censor: "[REDACTED]",
  },
  transport: isProd
    ? undefined
    : {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "SYS:standard" },
      },
});
