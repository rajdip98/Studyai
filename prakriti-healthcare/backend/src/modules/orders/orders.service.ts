import { nanoid } from "nanoid";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";
import { createRazorpayOrder } from "../payments/razorpay.client";

const FLAT_SHIPPING_PAISE = 0; // "Free shipping across India" per design

/**
 * Places an order from the user's current cart. All pricing is recomputed
 * server-side from the live Product table — client-submitted prices are
 * never trusted (classic price-tampering vector). Idempotency key ensures a
 * retried/double-clicked checkout never creates two orders or two payment
 * intents for the same attempt.
 */
export async function createOrderFromCart(userId: string, addressId: string, idempotencyKey: string) {
  const existing = await prisma.order.findUnique({
    where: { idempotencyKey },
    include: { items: true, payment: true },
  });
  if (existing) {
    if (existing.userId !== userId) {
      throw new AppError(409, "Idempotency key already used", "IDEMPOTENCY_CONFLICT");
    }
    return existing;
  }

  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) throw new AppError(404, "Address not found", "ADDRESS_NOT_FOUND");

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });
  if (!cart || cart.items.length === 0) throw new AppError(400, "Cart is empty", "CART_EMPTY");

  for (const item of cart.items) {
    if (!item.product.isActive) throw new AppError(409, `${item.product.name} is no longer available`, "PRODUCT_UNAVAILABLE");
    if (item.product.stockQuantity < item.quantity) {
      throw new AppError(409, `Insufficient stock for ${item.product.name}`, "INSUFFICIENT_STOCK");
    }
  }

  const subtotalInPaise = cart.items.reduce((sum, i) => sum + i.product.priceInPaise * i.quantity, 0);
  const totalInPaise = subtotalInPaise + FLAT_SHIPPING_PAISE;
  const orderNumber = `PHC-${Date.now().toString(36).toUpperCase()}-${nanoid(4).toUpperCase()}`;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        userId,
        addressId,
        subtotalInPaise,
        shippingInPaise: FLAT_SHIPPING_PAISE,
        totalInPaise,
        idempotencyKey,
        items: {
          create: cart.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPriceInPaise: i.product.priceInPaise,
            nameSnapshot: i.product.name,
          })),
        },
      },
      include: { items: true },
    });

    // Reserve stock immediately to prevent overselling between checkout and payment capture.
    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { decrement: item.quantity } },
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return created;
  });

  const gatewayOrder = await createRazorpayOrder(order.totalInPaise, order.orderNumber);

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      gatewayOrderId: gatewayOrder.id,
      amountInPaise: order.totalInPaise,
      status: "CREATED",
    },
  });

  return { ...order, payment };
}

export async function getOrderForUser(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true, payment: true, address: true },
  });
  if (!order) throw new AppError(404, "Order not found", "ORDER_NOT_FOUND");
  return order;
}

export async function listOrdersForUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: true, payment: true },
    orderBy: { createdAt: "desc" },
  });
}
