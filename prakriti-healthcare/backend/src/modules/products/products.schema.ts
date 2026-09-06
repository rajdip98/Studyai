import { z } from "zod";

export const listProductsQuerySchema = z.object({
  category: z.string().max(100).optional(),
  search: z.string().trim().max(100).optional(),
  bestseller: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const productSlugParamsSchema = z.object({
  slug: z.string().trim().min(1).max(200),
});

export const createProductSchema = z.object({
  slug: z.string().trim().min(1).max(200),
  name: z.string().trim().min(1).max(200),
  subtitle: z.string().trim().max(300).optional(),
  description: z.string().trim().min(1).max(5000),
  images: z.array(z.string().url().or(z.string().startsWith("/"))).max(10).default([]),
  priceInPaise: z.number().int().positive(),
  mrpInPaise: z.number().int().positive(),
  stockQuantity: z.number().int().min(0).default(0),
  sku: z.string().trim().min(1).max(64),
  isActive: z.boolean().default(true),
  isBestseller: z.boolean().default(false),
  tags: z.array(z.string().max(50)).max(20).default([]),
  ingredients: z.array(z.string().max(80)).max(30).default([]),
  // Nullable (not just optional) so PATCH can explicitly clear a product's
  // category — omitting the field on a partial update leaves it unchanged,
  // but sending `categoryId: null` removes it.
  categoryId: z.string().uuid().nullable().optional(),
});

export const updateProductSchema = createProductSchema.partial();
