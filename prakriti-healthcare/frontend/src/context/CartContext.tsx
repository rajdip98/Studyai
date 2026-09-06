import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { cartApi } from "../api/cart";
import type { Cart } from "../api/types";
import { useAuth } from "./AuthContext";

interface CartContextValue {
  cart: Cart | null;
  itemCount: number;
  /** True until the first cart fetch (or the decision to skip it, for a
   * logged-out visitor) has resolved. Callers should wait for this before
   * treating an empty cart as genuinely empty — otherwise a real cart with
   * items briefly flashes an "empty" message while it's still loading. */
  loading: boolean;
  refreshCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      const { cart } = await cartApi.get();
      setCart(cart);
    } catch {
      setCart(null);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    refreshCart().finally(() => setLoading(false));
  }, [refreshCart]);

  const addItem = useCallback(
    async (productId: string, quantity = 1) => {
      await cartApi.addItem(productId, quantity);
      await refreshCart();
    },
    [refreshCart],
  );

  const updateItem = useCallback(
    async (productId: string, quantity: number) => {
      await cartApi.updateItem(productId, quantity);
      await refreshCart();
    },
    [refreshCart],
  );

  const removeItem = useCallback(
    async (productId: string) => {
      await cartApi.removeItem(productId);
      await refreshCart();
    },
    [refreshCart],
  );

  const itemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <CartContext.Provider value={{ cart, itemCount, loading, refreshCart, addItem, updateItem, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
