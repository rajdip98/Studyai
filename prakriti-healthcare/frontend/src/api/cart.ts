import { api } from "./client";
import type { Cart } from "./types";

export const cartApi = {
  get: () => api.get<{ cart: Cart }>("/api/cart"),
  addItem: (productId: string, quantity = 1) =>
    api.post<{ item: unknown }>("/api/cart/items", { productId, quantity }),
  updateItem: (productId: string, quantity: number) =>
    api.patch<{ item: unknown }>(`/api/cart/items/${productId}`, { quantity }),
  removeItem: (productId: string) => api.delete<void>(`/api/cart/items/${productId}`),
};
