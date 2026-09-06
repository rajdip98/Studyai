import argon2 from "argon2";
import { z } from "zod";

// Argon2id: memory-hard, GPU/ASIC-resistant password hashing (OWASP's
// recommended default over bcrypt/scrypt for new systems).
const ARGON2_OPTS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19456, // ~19 MB
  timeCost: 2,
  parallelism: 1,
};

export function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, ARGON2_OPTS);
}

export function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return argon2.verify(hash, plain);
}

// NIST 800-63B-aligned policy: length over complexity theater, plus a
// denylist of the most common breached passwords for this domain.
const COMMON_PASSWORDS = new Set([
  "password", "password123", "12345678", "qwerty123", "prakriti123", "letmein1",
]);

export const passwordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters")
  .max(128)
  .refine((v) => !COMMON_PASSWORDS.has(v.toLowerCase()), "Password is too common")
  .refine((v) => /[a-z]/.test(v) && /[A-Z]/.test(v) && /[0-9]/.test(v), {
    message: "Password must include upper, lower case letters and a number",
  });
