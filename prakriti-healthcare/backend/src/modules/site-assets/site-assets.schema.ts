import { z } from "zod";

export const siteAssetTypeSchema = z.enum(["HERO_BANNER", "PROMO_BANNER", "POSTER", "PAYMENT_QR", "LOGO"]);

export const listSiteAssetsQuerySchema = z.object({
  type: siteAssetTypeSchema.optional(),
});

export const createSiteAssetSchema = z.object({
  type: siteAssetTypeSchema,
  url: z.string().trim().min(1).max(2000),
  key: z.string().trim().min(1).max(500),
  altText: z.string().trim().max(200).optional(),
  sortOrder: z.number().int().min(0).max(1000).default(0),
});

export const updateSiteAssetSchema = z.object({
  altText: z.string().trim().max(200).optional(),
  sortOrder: z.number().int().min(0).max(1000).optional(),
  isActive: z.boolean().optional(),
});

export const siteAssetIdParamsSchema = z.object({ id: z.string().uuid() });
