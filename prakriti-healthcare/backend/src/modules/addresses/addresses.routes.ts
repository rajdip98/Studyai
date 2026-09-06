import { Router } from "express";
import { prisma } from "../../config/prisma";
import asyncHandler from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";
import { verifyCsrfToken } from "../../middleware/csrf";
import { AppError } from "../../middleware/errorHandler";
import { addressIdParamsSchema, addressSchema } from "./addresses.schema";
import type { AuthedRequest } from "../../middleware/auth";

export const addressesRouter = Router();
addressesRouter.use(requireAuth);

addressesRouter.get(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    const addresses = await prisma.address.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: "desc" } });
    res.json({ addresses });
  }),
);

addressesRouter.post(
  "/",
  verifyCsrfToken,
  validate({ body: addressSchema }),
  asyncHandler(async (req: AuthedRequest, res) => {
    if (req.body.isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } });
    }
    const address = await prisma.address.create({ data: { ...req.body, userId: req.user!.id } });
    res.status(201).json({ address });
  }),
);

addressesRouter.delete(
  "/:id",
  verifyCsrfToken,
  validate({ params: addressIdParamsSchema }),
  asyncHandler(async (req: AuthedRequest, res) => {
    // Ownership check prevents IDOR — a user can only delete their own address.
    const address = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!address) throw new AppError(404, "Address not found", "ADDRESS_NOT_FOUND");
    await prisma.address.delete({ where: { id: address.id } });
    res.status(204).send();
  }),
);
