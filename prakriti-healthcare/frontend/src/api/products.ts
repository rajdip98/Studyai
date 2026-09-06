import { api } from "./client";
import type { Category, Product } from "./types";

export function listProducts(params: { category?: string; search?: string; bestseller?: boolean } = {}) {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.search) query.set("search", params.search);
  if (params.bestseller) query.set("bestseller", "true");
  const qs = query.toString();
  return api.get<{ items: Product[]; total: number }>(`/api/products${qs ? `?${qs}` : ""}`);
}

export function getProduct(slug: string) {
  return api.get<{ product: Product }>(`/api/products/${slug}`);
}

export function listCategories() {
  return api.get<{ categories: Category[] }>("/api/categories");
}
