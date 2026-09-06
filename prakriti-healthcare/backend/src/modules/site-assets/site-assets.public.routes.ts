import { Router } from "express";
import { prisma } from "../../config/prisma";
import asyncHandler from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { listSiteAssetsQuerySchema } from "./site-assets.schema";

// Public, read-only endpoint the storefront uses to render admin-managed
// content (homepage banners, posters, the payment QR code). Only active
// assets are ever exposed here — draft/hidden uploads stay admin-only.
export const siteAssetsPublicRouter = Router();

siteAssetsPublicRouter.get(
  "/",
  validate({ query: listSiteAssetsQuerySchema }),
  asyncHandler(async (req, res) => {
    const { type } = req.query as unknown as { type?: string };
    const assets = await prisma.siteAsset.findMany({
      where: { isActive: true, ...(type ? { type: type as never } : {}) },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, type: true, url: true, altText: true, sortOrder: true },
    });
    res.json({ assets });
  }),
);
