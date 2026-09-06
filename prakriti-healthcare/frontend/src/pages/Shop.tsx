import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { listProducts } from "../api/products";
import type { Product } from "../api/types";
import ProductCard from "../components/ProductCard";

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get("category") ?? undefined;
  const bestseller = searchParams.get("bestseller") === "true" ? true : undefined;
  const search = searchParams.get("search") ?? undefined;

  useEffect(() => {
    setLoading(true);
    listProducts({ category, bestseller, search })
      .then((r) => setProducts(r.items))
      .finally(() => setLoading(false));
  }, [category, bestseller, search]);

  return (
    <div className="container py-12">
      <h1 className="font-serif text-3xl font-semibold">{search ? `Results for "${search}"` : "All Products"}</h1>
      {loading ? (
        <p className="mt-8 text-muted">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="mt-8 text-muted">No products found.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
