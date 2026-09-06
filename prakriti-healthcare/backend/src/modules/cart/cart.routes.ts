import { Router } from "express";
import { prisma } from "../../config/prisma";
import asyncHandler from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";
import { verifyCsrfToken } from "../../middleware/csrf";
import { AppError } from "../../middleware/errorHandler";
import { addCartItemSchema, cartItemParamsSchema, updateCartItemSchema } from "./cart.schema";
import type { AuthedRequest } from "../../middleware/auth";

export const cartRouter = Router();
cartRouter.use(requireAuth);

async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: { items: { include: { product: true } } },
  });
}

cartRouter.get(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    const cart = await getOrCreateCart(req.user!.id);
    res.json({ cart });
  }),
);

cartRouter.post(
  "/items",
  verifyCsrfToken,
  validate({ body: addCartItemSchema }),
  asyncHandler(async (req: AuthedRequest, res) => {
    const { productId, quantity } = req.body;

    const product = await prisma.product.findFirst({ where: { id: productId, isActive: true } });
    if (!product) throw new AppError(404, "Product not found", "PRODUCT_NOT_FOUND");

    const cart = await prisma.cart.upsert({
      where: { userId: req.user!.id },
      update: {},
      create: { userId: req.user!.id },
    });

    const item = await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { quantity: { increment: quantity } },
      create: { cartId: cart.id, productId, quantity },
    });

    res.status(201).json({ item });
  }),
);

cartRouter.patch(
  "/items/:productId",
  verifyCsrfToken,
  validate({ params: cartItemParamsSchema, body: updateCartItemSchema }),
  asyncHandler(async (req: AuthedRequest, res) => {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (!cart) throw new AppError(404, "Cart not found", "CART_NOT_FOUND");

    const item = await prisma.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId: req.params.productId } },
      data: { quantity: req.body.quantity },
    });
    res.json({ item });
  }),
);

cartRouter.delete(
  "/items/:productId",
  verifyCsrfToken,
  validate({ params: cartItemParamsSchema }),
  asyncHandler(async (req: AuthedRequest, res) => {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (!cart) throw new AppError(404, "Cart not found", "CART_NOT_FOUND");

    await prisma.cartItem.delete({
      where: { cartId_productId: { cartId: cart.id, productId: req.params.productId } },
    });
    res.status(204).send();
  }),
);
