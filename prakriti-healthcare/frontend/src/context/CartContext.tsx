import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { cartApi } from "../api/cart";
import type { Cart } from "../api/types";
import { useAuth } from "./AuthContext";

interface CartContextValue {
  cart: Cart | null;
  itemCount: number;
  refreshCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);

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
    refreshCart();
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
    <CartContext.Provider value={{ cart, itemCount, refreshCart, addItem, updateItem, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
