import { z } from "zod";

export const createOrderSchema = z.object({
  addressId: z.string().uuid(),
});

export const orderIdParamsSchema = z.object({ id: z.string().uuid() });

export const idempotencyHeaderSchema = z
  .string()
  .min(8)
  .max(128)
  .regex(/^[a-zA-Z0-9_-]+$/);
