import { Router } from "express";
import { prisma } from "../../config/prisma";
import asyncHandler from "../../utils/asyncHandler";

export const activityPublicRouter = Router();

/**
 * Backs the storefront's "recent activity" notice. Returns only a product
 * name and a coarse relative time from the most recent paid order — no
 * customer name, location, or exact timestamp — because a real e-commerce
 * "someone just bought this" widget must reflect genuine orders, never
 * fabricated ones. If there's no recent real order, the frontend simply
 * doesn't show anything, rather than inventing one.
 */
activityPublicRouter.get(
  "/recent",
  asyncHandler(async (_req, res) => {
    const recentItem = await prisma.orderItem.findFirst({
      where: { order: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } } },
      orderBy: { order: { createdAt: "desc" } },
      select: { nameSnapshot: true, order: { select: { createdAt: true } } },
    });

    if (!recentItem) {
      res.json({ activity: null });
      return;
    }

    res.json({
      activity: {
        productName: recentItem.nameSnapshot,
        createdAt: recentItem.order.createdAt,
      },
    });
  }),
);
