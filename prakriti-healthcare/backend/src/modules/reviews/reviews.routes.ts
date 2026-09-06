import { Router } from "express";
import sanitizeHtml from "sanitize-html";
import { prisma } from "../../config/prisma";
import asyncHandler from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";
import { verifyCsrfToken } from "../../middleware/csrf";
import { AppError } from "../../middleware/errorHandler";
import { createReviewSchema } from "./reviews.schema";
import type { AuthedRequest } from "../../middleware/auth";

export const reviewsRouter = Router();

reviewsRouter.post(
  "/",
  requireAuth,
  verifyCsrfToken,
  validate({ body: createReviewSchema }),
  asyncHandler(async (req: AuthedRequest, res) => {
    const { productId, rating, title, body } = req.body;

    // Only customers who actually purchased & received the product may review it.
    const purchased = await prisma.orderItem.findFirst({
      where: { productId, order: { userId: req.user!.id, status: "DELIVERED" } },
    });

    // Strip any HTML/script content from user-supplied free text before storage
    // (defense in depth — the frontend also escapes on render).
    const cleanBody = sanitizeHtml(body, { allowedTags: [], allowedAttributes: {} });
    const cleanTitle = title ? sanitizeHtml(title, { allowedTags: [], allowedAttributes: {} }) : undefined;

    try {
      const review = await prisma.review.create({
        data: {
          productId,
          userId: req.user!.id,
          rating,
          title: cleanTitle,
          body: cleanBody,
          isVerified: Boolean(purchased),
        },
      });

      const agg = await prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: true,
      });
      await prisma.product.update({
        where: { id: productId },
        data: { ratingAverage: agg._avg.rating ?? 0, ratingCount: agg._count },
      });

      res.status(201).json({ review });
    } catch (err: unknown) {
      if ((err as { code?: string }).code === "P2002") {
        throw new AppError(409, "You have already reviewed this product", "REVIEW_EXISTS");
      }
      throw err;
    }
  }),
);
