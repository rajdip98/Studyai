import crypto from "node:crypto";
import { env } from "../../config/env";
import { logger } from "../../config/logger";

const RAZORPAY_API_BASE = "https://api.razorpay.com/v1";

function authHeader() {
  const token = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64");
  return `Basic ${token}`;
}

/**
 * Creates a Razorpay order server-side. We never let the client dictate the
 * charge amount — it is computed from the database order total.
 */
export async function createRazorpayOrder(amountInPaise: number, receipt: string) {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    // Local/dev fallback so the checkout flow can be exercised without live
    // gateway credentials configured.
    logger.warn("Razorpay credentials not configured — returning stub order");
    return { id: `order_stub_${receipt}`, amount: amountInPaise, currency: "INR" };
  }

  const res = await fetch(`${RAZORPAY_API_BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authHeader() },
    body: JSON.stringify({ amount: amountInPaise, currency: "INR", receipt }),
  });

  if (!res.ok) {
    const text = await res.text();
    logger.error({ status: res.status, text }, "Razorpay order creation failed");
    throw new Error("Payment gateway error");
  }

  return (await res.json()) as { id: string; amount: number; currency: string };
}

/** Verifies the client-returned checkout signature per Razorpay's HMAC scheme. */
export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string): boolean {
  if (!env.RAZORPAY_KEY_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return timingSafeEqualHex(expected, signature);
}

/** Verifies the X-Razorpay-Signature header on incoming webhooks. */
export function verifyWebhookSignature(rawBody: Buffer, signature: string | undefined): boolean {
  if (!env.RAZORPAY_WEBHOOK_SECRET || !signature) return false;
  const expected = crypto.createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest("hex");
  return timingSafeEqualHex(expected, signature);
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
