import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProduct } from "../api/products";
import { formatPaise, type Product } from "../api/types";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<"idle" | "adding" | "added" | "error">("idle");
  const { addItem } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (slug) getProduct(slug).then((r) => setProduct(r.product));
  }, [slug]);

  if (!product) return <div className="container py-20 text-center text-muted">Loading…</div>;

  return (
    <div className="container grid gap-10 py-12 md:grid-cols-2">
      <div className="aspect-square rounded-base bg-surface-subtle">
        {product.images[0] && <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />}
      </div>
      <div>
        <h1 className="font-serif text-3xl font-semibold">{product.name}</h1>
        {product.subtitle && <p className="mt-1 text-muted">{product.subtitle}</p>}
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-2xl font-semibold text-primary">{formatPaise(product.priceInPaise)}</span>
          {product.mrpInPaise > product.priceInPaise && (
            <span className="text-muted line-through">{formatPaise(product.mrpInPaise)}</span>
          )}
        </div>
        <p className="mt-6 text-sm leading-relaxed text-charcoal/80">{product.description}</p>

        {product.ingredients.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {product.ingredients.map((ing) => (
              <span key={ing} className="label-pill">
                {ing}
              </span>
            ))}
          </div>
        )}

        <button
          className="btn-primary mt-8 w-full sm:w-auto"
          disabled={status === "adding" || product.stockQuantity === 0}
          onClick={async () => {
            if (!user) {
              window.location.href = "/login";
              return;
            }
            setStatus("adding");
            try {
              await addItem(product.id, 1);
              setStatus("added");
            } catch {
              setStatus("error");
            }
          }}
        >
          {product.stockQuantity === 0
            ? "Out of Stock"
            : status === "added"
              ? "Added to Cart ✓"
              : "Add to Cart"}
        </button>
        {status === "error" && <p className="mt-2 text-sm text-sale">Could not add to cart. Please try again.</p>}
      </div>
    </div>
  );
}
