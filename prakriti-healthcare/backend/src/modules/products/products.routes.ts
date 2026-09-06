import { Router } from "express";
import type { z } from "zod";
import { prisma } from "../../config/prisma";
import asyncHandler from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { requireAuth, requireRole } from "../../middleware/auth";
import { verifyCsrfToken } from "../../middleware/csrf";
import { AppError } from "../../middleware/errorHandler";
import {
  createProductSchema,
  listProductsQuerySchema,
  productSlugParamsSchema,
  updateProductSchema,
} from "./products.schema";

export const productsRouter = Router();

productsRouter.get(
  "/",
  validate({ query: listProductsQuerySchema }),
  asyncHandler(async (req, res) => {
    const { category, search, bestseller, page, limit } = req.query as unknown as z.infer<
      typeof listProductsQuerySchema
    >;

    const where = {
      isActive: true,
      ...(category ? { category: { slug: category } } : {}),
      ...(bestseller !== undefined ? { isBestseller: bestseller } : {}),
      // `search` only feeds a parameterized `contains` filter — never raw SQL.
      ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({ items, total, page, limit });
  }),
);

productsRouter.get(
  "/:slug",
  validate({ params: productSlugParamsSchema }),
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findFirst({
      where: { slug: req.params.slug, isActive: true },
      include: { category: true, reviews: { orderBy: { createdAt: "desc" }, take: 20 } },
    });
    if (!product) throw new AppError(404, "Product not found", "PRODUCT_NOT_FOUND");
    res.json({ product });
  }),
);

// --- Admin-only management endpoints ---

productsRouter.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  verifyCsrfToken,
  validate({ body: createProductSchema }),
  asyncHandler(async (req, res) => {
    const product = await prisma.product.create({ data: req.body });
    res.status(201).json({ product });
  }),
);

productsRouter.patch(
  "/:slug",
  requireAuth,
  requireRole("ADMIN"),
  verifyCsrfToken,
  validate({ params: productSlugParamsSchema, body: updateProductSchema }),
  asyncHandler(async (req, res) => {
    const product = await prisma.product.update({ where: { slug: req.params.slug }, data: req.body });
    res.json({ product });
  }),
);

productsRouter.delete(
  "/:slug",
  requireAuth,
  requireRole("ADMIN"),
  verifyCsrfToken,
  validate({ params: productSlugParamsSchema }),
  asyncHandler(async (req, res) => {
    await prisma.product.update({ where: { slug: req.params.slug }, data: { isActive: false } });
    res.status(204).send();
  }),
);
