import { z } from "zod";
import { passwordSchema } from "../../utils/password";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(254),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(128),
  totpCode: z.string().length(6).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20).max(200),
  password: passwordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(20).max(200),
});

export const enable2faVerifySchema = z.object({
  totpCode: z.string().length(6),
});
