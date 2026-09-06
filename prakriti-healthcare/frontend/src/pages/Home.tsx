import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listCategories, listProducts } from "../api/products";
import type { Category, Product } from "../api/types";
import ProductCard from "../components/ProductCard";
import TrustBadges from "../components/TrustBadges";
import CategoryGrid from "../components/CategoryGrid";
import { listPublicSiteAssets, type PublicSiteAsset } from "../api/siteAssets";

export default function Home() {
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroBanner, setHeroBanner] = useState<PublicSiteAsset | null>(null);

  useEffect(() => {
    listProducts({ bestseller: true }).then((r) => setBestsellers(r.items.slice(0, 3)));
    listCategories().then((r) => setCategories(r.categories.slice(0, 6)));
    listPublicSiteAssets("HERO_BANNER").then((r) => setHeroBanner(r.assets[0] ?? null));
  }, []);

  return (
    <div>
      <section className="bg-surface-subtle">
        <div className="container grid items-center gap-10 py-16 md:grid-cols-2">
          <div>
            <span className="label-pill">100% Ayurvedic Natural Ingredients</span>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight md:text-5xl">
              Prakriti Bone Relief <span className="block text-secondary">Ortho Care</span>
            </h1>
            <p className="mt-4 max-w-md text-muted">
              Ancient Ayurvedic herbology engineered for modern joint vitality — clinically inspired whole-herb
              bio-actives for stronger bones and joints.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/shop" className="btn-primary">
                Shop Bestsellers
              </Link>
              <Link to="/shop" className="btn-secondary">
                Explore All Categories
              </Link>
            </div>
          </div>
          <div className="aspect-square overflow-hidden rounded-base bg-surface-pure shadow-level2">
            {heroBanner && (
              <img src={heroBanner.url} alt={heroBanner.altText ?? ""} className="h-full w-full object-cover" />
            )}
          </div>
        </div>
      </section>

      <CategoryGrid categories={categories} />

      <section className="container py-14">
        <h2 className="text-center font-serif text-2xl font-semibold">Our Bestsellers</h2>
        <p className="mt-2 text-center text-sm text-muted">
          Shop our most revered Ayurvedic formulations handcrafted from pure whole herbs.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3">
          {bestsellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <TrustBadges />
    </div>
  );
}
