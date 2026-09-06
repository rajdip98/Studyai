import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{10,15}$/, "Enter a valid phone number"),
  line1: z.string().trim().min(3).max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  postalCode: z
    .string()
    .trim()
    .regex(/^[0-9]{4,10}$/, "Enter a valid postal code"),
  country: z.string().trim().length(2).default("IN"),
  isDefault: z.boolean().default(false),
});

export const addressIdParamsSchema = z.object({ id: z.string().uuid() });
