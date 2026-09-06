import { Router } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { authLimiter, sensitiveActionLimiter } from "../../middleware/rateLimit";
import { requireAuth } from "../../middleware/auth";
import { verifyCsrfToken } from "../../middleware/csrf";
import * as controller from "./auth.controller";
import {
  enable2faVerifySchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.schema";

export const authRouter = Router();

authRouter.post("/register", authLimiter, validate({ body: registerSchema }), asyncHandler(controller.register));
authRouter.post("/login", authLimiter, validate({ body: loginSchema }), asyncHandler(controller.login));
authRouter.post("/refresh", asyncHandler(controller.refresh));
authRouter.post("/logout", verifyCsrfToken, asyncHandler(controller.logout));
authRouter.post("/logout-all", requireAuth, verifyCsrfToken, asyncHandler(controller.logoutAll));

authRouter.post(
  "/forgot-password",
  sensitiveActionLimiter,
  validate({ body: forgotPasswordSchema }),
  asyncHandler(controller.forgotPassword),
);
authRouter.post(
  "/reset-password",
  sensitiveActionLimiter,
  validate({ body: resetPasswordSchema }),
  asyncHandler(controller.resetPassword),
);
authRouter.post(
  "/verify-email",
  sensitiveActionLimiter,
  validate({ body: verifyEmailSchema }),
  asyncHandler(controller.verifyEmail),
);

authRouter.post("/2fa/start", requireAuth, verifyCsrfToken, asyncHandler(controller.start2fa));
authRouter.post(
  "/2fa/confirm",
  requireAuth,
  verifyCsrfToken,
  validate({ body: enable2faVerifySchema }),
  asyncHandler(controller.confirm2fa),
);
authRouter.post("/2fa/disable", requireAuth, verifyCsrfToken, asyncHandler(controller.disable2fa));

authRouter.get("/me", requireAuth, asyncHandler(controller.me));
