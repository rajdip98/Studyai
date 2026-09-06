import { Link } from "react-router-dom";
import type { Product } from "../api/types";
import { formatPaise } from "../api/types";

export default function ProductCard({ product }: { product: Product }) {
  const discountPct = Math.round(100 - (product.priceInPaise / product.mrpInPaise) * 100);

  return (
    <Link to={`/product/${product.slug}`} className="card group block overflow-hidden transition hover:shadow-level2">
      <div className="relative aspect-square bg-surface-subtle">
        {discountPct > 0 && (
          <span className="absolute left-2 top-2 rounded bg-sale px-2 py-1 text-xs font-bold text-white">
            {discountPct}% OFF
          </span>
        )}
        {product.images[0] ? (
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">No image</div>
        )}
      </div>
      <div className="space-y-1 p-4">
        <h3 className="font-semibold">{product.name}</h3>
        {product.subtitle && <p className="text-xs text-muted">{product.subtitle}</p>}
        <div className="flex items-center gap-1 text-xs text-gold-dark">
          {"★".repeat(Math.round(product.ratingAverage))}
          <span className="text-muted">({product.ratingCount})</span>
        </div>
        <div className="flex items-baseline gap-2 pt-1">
          <span className="font-semibold text-primary">{formatPaise(product.priceInPaise)}</span>
          {product.mrpInPaise > product.priceInPaise && (
            <span className="text-sm text-muted line-through">{formatPaise(product.mrpInPaise)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
