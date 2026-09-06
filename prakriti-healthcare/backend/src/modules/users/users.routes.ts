import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import asyncHandler from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";
import { verifyCsrfToken } from "../../middleware/csrf";
import { hashPassword, passwordSchema, verifyPassword } from "../../utils/password";
import { AppError } from "../../middleware/errorHandler";
import { revokeAllSessions } from "../auth/auth.service";
import { recordAudit } from "../../utils/audit";
import type { AuthedRequest } from "../../middleware/auth";

export const usersRouter = Router();
usersRouter.use(requireAuth);

usersRouter.get(
  "/me",
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, totpEnabled: true, emailVerifiedAt: true, createdAt: true },
    });
    if (!user) throw new AppError(404, "User not found", "USER_NOT_FOUND");
    res.json({ user });
  }),
);

const updateProfileSchema = z.object({ name: z.string().trim().min(2).max(100) });

usersRouter.patch(
  "/me",
  verifyCsrfToken,
  validate({ body: updateProfileSchema }),
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = await prisma.user.update({ where: { id: req.user!.id }, data: { name: req.body.name } });
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  }),
);

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: passwordSchema,
});

usersRouter.post(
  "/me/change-password",
  verifyCsrfToken,
  validate({ body: changePasswordSchema }),
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw new AppError(404, "User not found", "USER_NOT_FOUND");

    const valid = await verifyPassword(user.passwordHash, req.body.currentPassword);
    if (!valid) throw new AppError(401, "Current password is incorrect", "INVALID_CREDENTIALS");

    const passwordHash = await hashPassword(req.body.newPassword);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash, passwordUpdatedAt: new Date() } });

    // Changing your password invalidates every other active session.
    await revokeAllSessions(user.id);
    await recordAudit(req, "PASSWORD_CHANGED", { userId: user.id });

    res.json({ message: "Password changed. Please log in again on other devices." });
  }),
);
