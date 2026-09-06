import { Router } from "express";
import { prisma } from "../../config/prisma";
import asyncHandler from "../../utils/asyncHandler";

export const categoriesRouter = Router();

categoriesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    res.json({ categories });
  }),
);
