import { api } from "./client";
import type { Address, Order } from "./types";

export const addressesApi = {
  list: () => api.get<{ addresses: Address[] }>("/api/addresses"),
  create: (address: Omit<Address, "id" | "isDefault"> & { isDefault?: boolean }) =>
    api.post<{ address: Address }>("/api/addresses", address),
  remove: (id: string) => api.delete<void>(`/api/addresses/${id}`),
};

export const ordersApi = {
  list: () => api.get<{ orders: Order[] }>("/api/orders"),
  get: (id: string) => api.get<{ order: Order }>(`/api/orders/${id}`),
  create: (addressId: string, idempotencyKey: string) =>
    api.post<{ order: Order & { payment: { gatewayOrderId: string } } }>(
      "/api/orders",
      { addressId },
      idempotencyKey,
    ),
};
