import { api, uploadFile } from "./client";
import type { Product } from "./types";

export type SiteAssetType = "HERO_BANNER" | "PROMO_BANNER" | "POSTER" | "PAYMENT_QR" | "LOGO";

export interface SiteAsset {
  id: string;
  type: SiteAssetType;
  url: string;
  altText?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export const adminApi = {
  uploadImage: (file: File) => uploadFile("/api/admin/uploads", file),

  listAssets: (type?: SiteAssetType) =>
    api.get<{ assets: SiteAsset[] }>(`/api/admin/site-assets${type ? `?type=${type}` : ""}`),
  createAsset: (data: { type: SiteAssetType; url: string; key: string; altText?: string; sortOrder?: number }) =>
    api.post<{ asset: SiteAsset }>("/api/admin/site-assets", data),
  updateAsset: (id: string, data: Partial<Pick<SiteAsset, "altText" | "sortOrder" | "isActive">>) =>
    api.patch<{ asset: SiteAsset }>(`/api/admin/site-assets/${id}`, data),
  deleteAsset: (id: string) => api.delete<void>(`/api/admin/site-assets/${id}`),

  listProducts: (page = 1) => api.get<{ items: Product[]; total: number; page: number; limit: number }>(`/api/admin/products?page=${page}`),
  createProduct: (data: Record<string, unknown>) => api.post<{ product: Product }>("/api/products", data),
  updateProduct: (slug: string, data: Record<string, unknown>) =>
    api.patch<{ product: Product }>(`/api/products/${slug}`, data),
  deleteProduct: (slug: string) => api.delete<void>(`/api/products/${slug}`),

  listOrders: (page = 1) => api.get<{ orders: unknown[]; total: number }>(`/api/admin/orders?page=${page}`),
};
