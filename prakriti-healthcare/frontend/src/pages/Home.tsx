import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getProduct, listCategories, listProducts } from "../api/products";
import type { Category, Product } from "../api/types";
import { formatPaise } from "../api/types";
import ProductCard from "../components/ProductCard";
import TrustBadges from "../components/TrustBadges";
import CategoryGrid from "../components/CategoryGrid";
import Testimonials from "../components/Testimonials";
import OurStory from "../components/OurStory";
import AnnouncementTicker from "../components/AnnouncementTicker";
import Icon from "../components/Icon";
import { listPublicSiteAssets, type PublicSiteAsset } from "../api/siteAssets";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const HERO_PRODUCT_SLUG = "prakriti-bone-relief";

const heroBenefits = [
  { icon: "accessibility_new", label: "Neck Pain Relief" },
  { icon: "sports_gymnastics", label: "Shoulder Support" },
  { icon: "directions_walk", label: "Knee Care" },
  { icon: "healing", label: "Joint Pain Relief" },
  { icon: "spa", label: "Pure Herbs" },
  { icon: "science", label: "No Chemicals" },
  { icon: "sprint", label: "Better Mobility" },
  { icon: "verified", label: "Lab Tested", gold: true },
];

const glossaryTerms = [
  "Herbal Supplements", "Ayurvedic Products", "Immunity Boosters", "Digestive Care", "Women's Wellness",
  "Men's Health", "Joint & Bone Care", "Heart Health", "Liver Care", "Kidney Care", "Diabetes Support",
  "Weight Management", "Skin Care", "Hair Care", "Ayurvedic Syrups", "Herbal Tablets", "Herbal Capsules",
  "Natural Powders", "Herbal Juices", "Daily Wellness", "Energy & Vitality", "Stress Relief", "Sleep Support",
  "Multivitamins", "Plant-Based Nutrition", "Vegan Supplements", "Organic Wellness", "Healthy Lifestyle",
  "Natural Health Products", "Gut Health", "Detox & Cleansing", "Bone Strength", "Brain Health", "Eye Care",
];

export default function Home() {
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroBanner, setHeroBanner] = useState<PublicSiteAsset | null>(null);
  const [heroProduct, setHeroProduct] = useState<Product | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    listProducts({ bestseller: true }).then((r) => setBestsellers(r.items.slice(0, 3)));
    listCategories().then((r) => setCategories(r.categories.slice(0, 6)));
    listPublicSiteAssets("HERO_BANNER").then((r) => setHeroBanner(r.assets[0] ?? null));
    getProduct(HERO_PRODUCT_SLUG)
      .then((r) => setHeroProduct(r.product))
      .catch(() => setHeroProduct(null));
  }, []);

  const discountPct = heroProduct ? Math.round(100 - (heroProduct.priceInPaise / heroProduct.mrpInPaise) * 100) : 0;

  return (
    <div>
      <AnnouncementTicker />

      {/* HERO */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-surface-subtle via-surface-cream to-surface-cream py-12 lg:py-20">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-secondary-fixed/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-10 h-80 w-80 rounded-full bg-gold-light/30 blur-2xl" />
        <div className="container relative z-10 mx-auto grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="flex flex-col items-start gap-3 lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-surface-pure px-3.5 py-1.5 shadow-sm">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-leaf-vibrant" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                100% Ayurvedic Natural Ingredients
              </span>
            </div>
            <h1 className="mt-1 font-serif text-4xl font-semibold leading-tight text-primary md:text-5xl">
              {heroProduct?.name ?? "Prakriti Bone Relief"}
              <span className="mt-1 block text-2xl font-medium italic text-secondary md:text-3xl">Ortho Care</span>
            </h1>
            <p className="font-serif text-lg text-gold-dark">
              {heroProduct?.subtitle ?? "Supports Stronger Bones & Joints"}
            </p>
            <p className="max-w-xl leading-relaxed text-muted">
              {heroProduct?.description ??
                "Ancient Ayurvedic herbology engineered for modern joint vitality. Clinically inspired whole-herb bio-actives targeted to alleviate joint inflammation, restore fluid mobility, and nourish structural bone density naturally."}
            </p>

            <div className="my-2 grid w-full grid-cols-3 gap-3 py-1 sm:grid-cols-4">
              {heroBenefits.map((b) => (
                <div
                  key={b.label}
                  className="flex flex-col items-center gap-1.5 rounded-lg bg-surface-pure p-3 text-center shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  <Icon name={b.icon} className={`text-2xl ${b.gold ? "text-gold-dark" : "text-secondary"}`} />
                  <span className="text-xs font-medium text-charcoal">{b.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {heroProduct && (
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-2xl font-bold text-primary">{formatPaise(heroProduct.priceInPaise)}</span>
                    <span className="text-muted line-through">{formatPaise(heroProduct.mrpInPaise)}</span>
                  </div>
                  {discountPct > 0 && (
                    <span className="text-xs font-bold text-sale">
                      Save {formatPaise(heroProduct.mrpInPaise - heroProduct.priceInPaise)} ({discountPct}% OFF)
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-3">
                <Link
                  to={heroProduct ? `/product/${heroProduct.slug}` : "/shop"}
                  className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-primary-dark hover:shadow-lg active:scale-95"
                >
                  <span>ORDER NOW</span>
                  <Icon name="arrow_forward" className="text-lg" />
                </Link>
                {heroProduct && (
                  <button
                    onClick={() =>
                      user ? addItem(heroProduct.id, 1) : navigate("/login", { state: { from: location } })
                    }
                    className="flex items-center gap-1.5 rounded-xl bg-surface-cream px-5 py-3.5 font-semibold text-gold-dark shadow-sm transition-all hover:bg-gold-light"
                  >
                    <Icon name="add_shopping_cart" className="text-lg" />
                    <span>Cart</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 text-sm text-muted">
              <span className="flex text-gold-dark">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Icon key={i} name="star" filled className="text-base" />
                ))}
                <Icon name="star_half" filled className="text-base" />
              </span>
              <span>
                <strong>4.8/5</strong> from 1,240+ pain-free patients across India
              </span>
            </div>
          </div>

          <div className="relative flex items-center justify-center lg:col-span-6">
            <div className="relative flex aspect-square w-full max-w-lg items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-tr from-surface-cream via-surface-pure to-surface-subtle p-10 shadow-xl">
              <div className="pointer-events-none absolute inset-4 rounded-full border border-gold-light/40" />
              <div className="pointer-events-none absolute inset-16 rounded-full border border-secondary/10" />
              {discountPct > 0 && (
                <div className="absolute left-6 top-6 rounded-full bg-sale px-3 py-1 text-xs font-bold tracking-wider text-white shadow-md">
                  {discountPct}% OFF · LIMITED BATCH
                </div>
              )}
              <div className="absolute right-6 top-6 flex flex-col items-center rounded-xl bg-surface-pure/90 px-3 py-2 shadow-sm backdrop-blur-md">
                <Icon name="verified_user" className="text-2xl text-leaf-vibrant" />
                <span className="text-xs font-bold text-primary">100% AYUSH</span>
                <span className="text-[9px] uppercase tracking-tighter text-muted">Standardized</span>
              </div>

              {heroBanner ? (
                <img
                  src={heroBanner.url}
                  alt={heroBanner.altText ?? heroProduct?.name ?? "Prakriti Healthcare"}
                  className="relative z-10 h-full w-full object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <Icon name="spa" className="relative z-10 text-8xl text-primary-container/30" />
              )}

              <div className="absolute bottom-6 z-20 flex items-center gap-3 rounded-full bg-surface-pure/95 px-4 py-2 shadow-lg backdrop-blur-md">
                <span className="h-2.5 w-2.5 rounded-full bg-leaf-vibrant" />
                <span className="text-sm font-bold text-primary">60 Vegetarian Capsules</span>
                <span className="text-xs text-muted">|</span>
                <span className="text-xs text-muted">1 Month Course</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CategoryGrid categories={categories} />

      {/* BESTSELLERS */}
      <section className="w-full bg-surface-subtle py-16">
        <div className="container mx-auto">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">
              Time-Tested Clinical Formulations
            </span>
            <h2 className="mt-1 font-serif text-3xl font-semibold text-primary">Our Bestsellers</h2>
            <p className="mt-2 text-sm text-muted">
              Shop our most revered Ayurvedic supplements handcrafted from pure whole herbs and standardized potent
              extracts.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <TrustBadges />
      <Testimonials />
      <OurStory />

      {/* SEO GLOSSARY */}
      <section className="w-full border-t border-surface-variant/40 bg-surface py-10">
        <div className="container mx-auto text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted">
            Complete Botanical Formulations & Remedies
          </span>
          <p className="mx-auto mt-3 max-w-5xl text-center text-xs leading-relaxed text-muted opacity-85">
            {glossaryTerms.join(" • ")}
          </p>
        </div>
      </section>
    </div>
  );
}
