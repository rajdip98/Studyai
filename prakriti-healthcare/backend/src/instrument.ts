// Must be imported before any other module (Sentry auto-instrumentation
// requirement). See server.ts.
import * as Sentry from "@sentry/node";
import { env, isProd } from "./config/env";

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: isProd ? 0.1 : 1.0,
    // Scrub anything that looks like a secret/PII before it leaves the process.
    beforeSend(event) {
      if (event.request?.cookies) delete event.request.cookies;
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      return event;
    },
  });
}
