import express from "express";
import pinoHttp from "pino-http";
import { applyBaselineSecurity } from "./middleware/security";
import { requestId } from "./middleware/requestId";
import { issueCsrfToken } from "./middleware/csrf";
import { apiLimiter } from "./middleware/rateLimit";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { logger } from "./config/logger";
import { UPLOAD_DIR } from "./utils/storage";
import { httpRequestDuration, healthRouter } from "./modules/health/health.routes";
import { authRouter } from "./modules/auth/auth.routes";
import { usersRouter } from "./modules/users/users.routes";
import { productsRouter } from "./modules/products/products.routes";
import { categoriesRouter } from "./modules/categories/categories.routes";
import { cartRouter } from "./modules/cart/cart.routes";
import { addressesRouter } from "./modules/addresses/addresses.routes";
import { ordersRouter } from "./modules/orders/orders.routes";
import { activityPublicRouter } from "./modules/orders/activity.public.routes";
import { paymentsRouter } from "./modules/payments/payments.routes";
import { reviewsRouter } from "./modules/reviews/reviews.routes";
import { siteAssetsPublicRouter } from "./modules/site-assets/site-assets.public.routes";
import { adminRouter } from "./modules/admin/admin.routes";

export function createApp() {
  const app = express();

  app.use(requestId);

  // The Razorpay webhook needs the exact raw request bytes to verify its
  // HMAC signature, so it must be captured BEFORE the global JSON body
  // parser (registered inside applyBaselineSecurity) runs. body-parser
  // skips re-parsing once `req._body` has been set, so this is safe.
  app.use("/api/payments/webhook", express.raw({ type: "application/json", limit: "1mb" }));

  applyBaselineSecurity(app);

  app.use(
    pinoHttp({
      logger,
      customProps: (req) => ({ requestId: req.headers["x-request-id"] }),
      autoLogging: { ignore: (req) => req.url === "/health/live" },
    }),
  );

  app.use((req, res, next) => {
    const end = httpRequestDuration.startTimer();
    res.on("finish", () => end({ method: req.method, route: req.route?.path ?? req.path, status_code: res.statusCode }));
    next();
  });

  app.use("/health", healthRouter);

  // Local-disk fallback for uploaded images (admin banners/posters/payment QR/
  // product images) when S3 isn't configured — see utils/storage.ts. Public,
  // read-only, content-addressed by a random filename (never the original
  // upload name), so serving it without auth is safe.
  app.use(
    "/uploads",
    express.static(UPLOAD_DIR, {
      maxAge: "1y",
      immutable: true,
      setHeaders: (res) => res.setHeader("X-Content-Type-Options", "nosniff"),
    }),
  );

  // Global API rate limit as a backstop; individual sensitive routes layer
  // tighter, route-specific limits on top (see rateLimit.ts).
  app.use("/api", apiLimiter);
  app.use("/api", issueCsrfToken);

  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/categories", categoriesRouter);
  app.use("/api/cart", cartRouter);
  app.use("/api/addresses", addressesRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/activity", activityPublicRouter);
  app.use("/api/payments", paymentsRouter);
  app.use("/api/reviews", reviewsRouter);
  app.use("/api/site-assets", siteAssetsPublicRouter);
  app.use("/api/admin", adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
