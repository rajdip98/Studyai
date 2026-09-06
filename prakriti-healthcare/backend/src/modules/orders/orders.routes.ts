import { Router } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";
import { verifyCsrfToken } from "../../middleware/csrf";
import { paymentLimiter } from "../../middleware/rateLimit";
import { AppError } from "../../middleware/errorHandler";
import { createOrderSchema, idempotencyHeaderSchema, orderIdParamsSchema } from "./orders.schema";
import * as ordersService from "./orders.service";
import type { AuthedRequest } from "../../middleware/auth";

export const ordersRouter = Router();
ordersRouter.use(requireAuth);

ordersRouter.get(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    const orders = await ordersService.listOrdersForUser(req.user!.id);
    res.json({ orders });
  }),
);

ordersRouter.get(
  "/:id",
  validate({ params: orderIdParamsSchema }),
  asyncHandler(async (req: AuthedRequest, res) => {
    const order = await ordersService.getOrderForUser(req.user!.id, req.params.id);
    res.json({ order });
  }),
);

ordersRouter.post(
  "/",
  paymentLimiter,
  verifyCsrfToken,
  validate({ body: createOrderSchema }),
  asyncHandler(async (req: AuthedRequest, res) => {
    const idempotencyKeyRaw = req.header("x-idempotency-key");
    const parsed = idempotencyHeaderSchema.safeParse(idempotencyKeyRaw);
    if (!parsed.success) {
      throw new AppError(400, "Missing or invalid X-Idempotency-Key header", "IDEMPOTENCY_KEY_REQUIRED");
    }

    const order = await ordersService.createOrderFromCart(req.user!.id, req.body.addressId, parsed.data);
    res.status(201).json({ order });
  }),
);
