import { z } from "zod";

export const verifyPaymentSchema = z.object({
  orderId: z.string().uuid(),
  razorpayOrderId: z.string().min(1).max(100),
  razorpayPaymentId: z.string().min(1).max(100),
  razorpaySignature: z.string().min(1).max(200),
});
