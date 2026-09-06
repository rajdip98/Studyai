import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import asyncHandler from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { requireAuth, requireRole } from "../../middleware/auth";
import { verifyCsrfToken } from "../../middleware/csrf";
import { uploadLimiter } from "../../middleware/rateLimit";
import { AppError } from "../../middleware/errorHandler";
import { recordAudit } from "../../utils/audit";
import { detectImageType, saveUpload, deleteUpload } from "../../utils/storage";
import {
  createSiteAssetSchema,
  siteAssetIdParamsSchema,
  updateSiteAssetSchema,
} from "../site-assets/site-assets.schema";
import type { AuthedRequest } from "../../middleware/auth";

export const adminRouter = Router();

// Every route below is admin-only, defense in depth via both middleware and
// (for destructive actions) an explicit audit trail.
adminRouter.use(requireAuth, requireRole("ADMIN"));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

// Generic image upload used by every admin upload section (banners, posters,
// the payment QR code, product images). The file type is verified from its
// actual bytes (see utils/storage.ts) — the client-reported MIME type and
// filename are never trusted. This endpoint only stores the file and hands
// back a URL; callers persist a SiteAsset record (below) or attach the URL
// to a Product themselves.
adminRouter.post(
  "/uploads",
  uploadLimiter,
  verifyCsrfToken,
  upload.single("file"),
  asyncHandler(async (req: AuthedRequest, res) => {
    if (!req.file) throw new AppError(400, "No file was uploaded", "NO_FILE");

    const detected = detectImageType(req.file.buffer);
    if (!detected) {
      throw new AppError(400, "Unsupported file type. Upload a PNG, JPEG, or WEBP image.", "INVALID_FILE_TYPE");
    }

    const { url, key } = await saveUpload(req.file.buffer, detected.ext, detected.mime);
    await recordAudit(req, "FILE_UPLOADED", {
      userId: req.user!.id,
      metadata: { key, size: req.file.size, mime: detected.mime },
    });
    res.status(201).json({ url, key });
  }),
);

// --- Site assets (banners, posters, payment QR code, logo) ---

adminRouter.get(
  "/site-assets",
  asyncHandler(async (req, res) => {
    const type = req.query.type as string | undefined;
    const assets = await prisma.siteAsset.findMany({
      where: type ? { type: type as never } : undefined,
      orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
    });
    res.json({ assets });
  }),
);

adminRouter.post(
  "/site-assets",
  verifyCsrfToken,
  validate({ body: createSiteAssetSchema }),
  asyncHandler(async (req: AuthedRequest, res) => {
    const asset = await prisma.siteAsset.create({
      data: {
        type: req.body.type,
        url: req.body.url,
        storageKey: req.body.key,
        altText: req.body.altText,
        sortOrder: req.body.sortOrder,
        uploadedById: req.user!.id,
      },
    });
    await recordAudit(req, "SITE_ASSET_CREATED", {
      userId: req.user!.id,
      targetType: "SiteAsset",
      targetId: asset.id,
      metadata: { type: asset.type },
    });
    res.status(201).json({ asset });
  }),
);

adminRouter.patch(
  "/site-assets/:id",
  verifyCsrfToken,
  validate({ params: siteAssetIdParamsSchema, body: updateSiteAssetSchema }),
  asyncHandler(async (req: AuthedRequest, res) => {
    const asset = await prisma.siteAsset.update({ where: { id: req.params.id }, data: req.body });
    res.json({ asset });
  }),
);

adminRouter.delete(
  "/site-assets/:id",
  verifyCsrfToken,
  validate({ params: siteAssetIdParamsSchema }),
  asyncHandler(async (req: AuthedRequest, res) => {
    const asset = await prisma.siteAsset.findUnique({ where: { id: req.params.id } });
    if (!asset) throw new AppError(404, "Asset not found", "ASSET_NOT_FOUND");

    await prisma.siteAsset.delete({ where: { id: asset.id } });
    await deleteUpload(asset.storageKey).catch(() => undefined);
    await recordAudit(req, "SITE_ASSET_DELETED", {
      userId: req.user!.id,
      targetType: "SiteAsset",
      targetId: asset.id,
    });
    res.status(204).send();
  }),
);

// --- Products (admin listing includes inactive products; management
// mutations reuse the existing admin-only endpoints on /api/products) ---

adminRouter.get(
  "/products",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        include: { category: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count(),
    ]);
    res.json({ items, total, page, limit });
  }),
);

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
