import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import asyncHandler from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { requireAuth, requireRole } from "../../middleware/auth";
import { verifyCsrfToken } from "../../middleware/csrf";
import { recordAudit } from "../../utils/audit";
import type { AuthedRequest } from "../../middleware/auth";

export const adminRouter = Router();

// Every route below is admin-only, defense in depth via both middleware and
// (for destructive actions) an explicit audit trail.
adminRouter.use(requireAuth, requireRole("ADMIN"));

adminRouter.get(
  "/orders",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        include: { items: true, payment: true, user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count(),
    ]);
    res.json({ orders, total, page, limit });
  }),
);

const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING_PAYMENT", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED", "FAILED"]),
});

adminRouter.patch(
  "/orders/:id/status",
  verifyCsrfToken,
  validate({ params: z.object({ id: z.string().uuid() }), body: updateOrderStatusSchema }),
  asyncHandler(async (req: AuthedRequest, res) => {
    const order = await prisma.order.update({ where: { id: req.params.id }, data: { status: req.body.status } });
    await recordAudit(req, "ORDER_STATUS_CHANGED", {
      userId: req.user!.id,
      targetType: "Order",
      targetId: order.id,
      metadata: { status: order.status },
    });
    res.json({ order });
  }),
);

adminRouter.get(
  "/users",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, createdAt: true, emailVerifiedAt: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count(),
    ]);
    res.json({ users, total, page, limit });
  }),
);

adminRouter.get(
  "/audit-logs",
  asyncHandler(async (req, res) => {
    const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
    res.json({ logs });
  }),
);
