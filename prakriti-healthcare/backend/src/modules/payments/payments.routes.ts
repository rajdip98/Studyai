import { Router } from "express";
import crypto from "node:crypto";
import { prisma } from "../../config/prisma";
import { logger } from "../../config/logger";
import asyncHandler from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";
import { verifyCsrfToken } from "../../middleware/csrf";
import { paymentLimiter } from "../../middleware/rateLimit";
import { AppError } from "../../middleware/errorHandler";
import { verifyPaymentSchema } from "./payments.schema";
import { verifyCheckoutSignature, verifyWebhookSignature } from "./razorpay.client";
import type { AuthedRequest } from "../../middleware/auth";

export const paymentsRouter = Router();

/**
 * Confirms payment immediately after the client-side Razorpay checkout
 * completes. This is a UX fast-path only — the webhook below is the
 * authoritative source of truth, since this endpoint could in theory be
 * called by a malicious client with forged (but unsignable) data. The HMAC
 * signature check is what actually proves the payment is genuine.
 */
paymentsRouter.post(
  "/verify",
  requireAuth,
  paymentLimiter,
  verifyCsrfToken,
  validate({ body: verifyPaymentSchema }),
  asyncHandler(async (req: AuthedRequest, res) => {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user!.id },
      include: { payment: true },
    });
    if (!order || !order.payment) throw new AppError(404, "Order not found", "ORDER_NOT_FOUND");
    if (order.payment.gatewayOrderId !== razorpayOrderId) {
      throw new AppError(400, "Order/payment mismatch", "PAYMENT_MISMATCH");
    }

    const valid = verifyCheckoutSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!valid) {
      logger.warn({ orderId }, "Rejected payment verification with invalid signature");
      throw new AppError(400, "Payment verification failed", "INVALID_SIGNATURE");
    }

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: order.payment.id },
        data: { gatewayPaymentId: razorpayPaymentId, status: "CAPTURED", signatureVerified: true },
      }),
      prisma.order.update({ where: { id: order.id }, data: { status: "PAID" } }),
    ]);

    res.json({ message: "Payment verified" });
  }),
);

/**
 * Razorpay server-to-server webhook. Mounted with a raw body parser (see
 * app.ts) so the HMAC signature can be verified over the exact bytes sent —
 * verifying a re-serialized JSON body would silently break on whitespace
 * differences and is a common webhook-security bug.
 */
paymentsRouter.post(
  "/webhook",
  asyncHandler(async (req, res) => {
    const rawBody = req.body as Buffer;
    const signature = req.header("x-razorpay-signature");

    if (!Buffer.isBuffer(rawBody) || !verifyWebhookSignature(rawBody, signature)) {
      logger.warn("Rejected webhook with invalid or missing signature");
      res.status(400).json({ error: "Invalid signature" });
      return;
    }

    const payloadHash = crypto.createHash("sha256").update(rawBody).digest("hex");
    const event = JSON.parse(rawBody.toString("utf8")) as {
      event: string;
      payload: { payment: { entity: { id: string; order_id: string } } };
    };

    const gatewayOrderId = event.payload?.payment?.entity?.order_id;
    if (!gatewayOrderId) {
      res.status(200).json({ received: true });
      return;
    }

    const payment = await prisma.payment.findFirst({ where: { gatewayOrderId } });
    if (!payment) {
      res.status(200).json({ received: true });
      return;
    }

    // Replay protection: skip if we've already processed this exact webhook body.
    if (payment.rawWebhookHash === payloadHash) {
      res.status(200).json({ received: true, duplicate: true });
      return;
    }

    if (event.event === "payment.captured") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "CAPTURED",
            gatewayPaymentId: event.payload.payment.entity.id,
            signatureVerified: true,
            rawWebhookHash: payloadHash,
          },
        }),
        prisma.order.update({ where: { id: payment.orderId }, data: { status: "PAID" } }),
      ]);
    } else if (event.event === "payment.failed") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: { status: "FAILED", rawWebhookHash: payloadHash },
        }),
        prisma.order.update({ where: { id: payment.orderId }, data: { status: "FAILED" } }),
      ]);
    }

    res.status(200).json({ received: true });
  }),
);
