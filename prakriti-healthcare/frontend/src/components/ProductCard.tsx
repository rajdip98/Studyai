import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { Product } from "../api/types";
import { formatPaise } from "../api/types";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";

export default function ProductCard({ product }: { product: Product }) {
  const discountPct = Math.round(100 - (product.priceInPaise / product.mrpInPaise) * 100);
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const inStock = product.stockQuantity > 0;

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    setAdding(true);
    try {
      await addItem(product.id, 1);
    } finally {
      setAdding(false);
    }
  }

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group flex flex-col justify-between rounded-2xl bg-surface-pure p-4 shadow-sm transition-all duration-300 hover:shadow-xl"
    >
      <div>
        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-surface-subtle p-6">
          {discountPct > 0 && (
            <span className="absolute left-3 top-3 rounded-md bg-sale px-2.5 py-1 text-xs font-bold uppercase text-white">
              Sale
            </span>
          )}
          <button
            aria-label="Add to Wishlist"
            onClick={(e) => e.preventDefault()}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface-pure/80 text-muted shadow-sm backdrop-blur-sm transition-colors hover:text-sale"
          >
            <Icon name="favorite" className="text-lg" />
          </button>
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <Icon name="spa" className="text-6xl text-primary-container/20" />
          )}
        </div>

        <div className="mt-4 flex items-center gap-1 text-xs text-gold-dark">
          {Array.from({ length: 5 }).map((_, i) => (
            <Icon key={i} name="star" filled className={i < Math.round(product.ratingAverage) ? "" : "opacity-30"} />
          ))}
          <span className="ml-1 text-muted">({product.ratingCount} Reviews)</span>
        </div>
        <h3 className="mt-1 font-serif text-sm font-semibold text-primary transition-colors group-hover:text-secondary">
          {product.name}
        </h3>
        {product.subtitle && <p className="mt-1 text-xs text-muted">{product.subtitle}</p>}
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-surface-subtle pt-4">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-serif font-bold text-primary">{formatPaise(product.priceInPaise)}</span>
            {product.mrpInPaise > product.priceInPaise && (
              <span className="text-sm text-muted line-through">{formatPaise(product.mrpInPaise)}</span>
            )}
          </div>
          <span className={`text-xs font-semibold ${inStock ? "text-leaf-vibrant" : "text-sale"}`}>
            {inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={!inStock || adding}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name="shopping_cart" className="text-lg" />
          <span>{adding ? "Adding…" : "ADD TO CART"}</span>
        </button>
      </div>
    </Link>
  );
}
