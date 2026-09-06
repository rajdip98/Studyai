import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPaise } from "../api/types";

export default function Cart() {
  const { cart, loading, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, i) => sum + i.product.priceInPaise * i.quantity, 0);

  if (loading) {
    return <div className="container py-20 text-center text-muted">Loading your cart…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted">Your cart is empty.</p>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="font-serif text-3xl font-semibold">Your Cart</h1>
      <div className="mt-8 grid gap-10 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          {items.map((item) => (
            <div key={item.id} className="card flex items-center gap-4 p-4">
              <div className="h-20 w-20 flex-shrink-0 rounded-base bg-surface-subtle">
                {item.product.images[0] && (
                  <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.product.name}</p>
                <p className="text-sm text-muted">{formatPaise(item.product.priceInPaise)}</p>
              </div>
              <input
                type="number"
                min={1}
                max={20}
                value={item.quantity}
                onChange={(e) => updateItem(item.productId, Math.max(1, Number(e.target.value)))}
                className="input-field !h-10 w-16 text-center"
              />
              <button
                className="text-sm text-sale hover:underline"
                onClick={() => removeItem(item.productId)}
                aria-label={`Remove ${item.product.name}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="card h-fit space-y-3 p-6">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatPaise(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between border-t border-border-earth pt-3 font-semibold">
            <span>Total</span>
            <span>{formatPaise(subtotal)}</span>
          </div>
          <button className="btn-primary w-full" onClick={() => navigate("/checkout")}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
