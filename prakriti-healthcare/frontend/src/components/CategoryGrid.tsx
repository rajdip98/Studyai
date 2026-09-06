import { Link } from "react-router-dom";
import type { Category } from "../api/types";
import Icon from "./Icon";

// Icon + subtitle per category slug, matching the brand design exactly.
// Falls back to a generic leaf icon for any category not in this map.
const CATEGORY_META: Record<string, { icon: string; subtitle: string }> = {
  immunity: { icon: "shield_moon", subtitle: "Ojas & Vitality" },
  "bone-care": { icon: "accessibility_new", subtitle: "Joint & Cartilage" },
  "womens-care": { icon: "self_improvement", subtitle: "Hormone Balance" },
  diabetes: { icon: "monitor_heart", subtitle: "Sugar Metabolism" },
  digestion: { icon: "restaurant", subtitle: "Agni Restoration" },
  "heart-care": { icon: "favorite", subtitle: "Cardio Vitality" },
};

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="w-full bg-surface-cream py-14">
      <div className="container mx-auto">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">Ayurvedic Diagnostics</span>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-primary">Shop By Concern</h2>
            <p className="mt-1 text-sm text-muted">Targeted traditional formulations categorized by physiological balance.</p>
          </div>
          <Link to="/shop" className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-primary">
            <span>Explore All Categories</span>
            <Icon name="arrow_forward" className="text-base" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => {
            const meta = CATEGORY_META[c.slug] ?? { icon: "eco", subtitle: c.description ?? "" };
            return (
              <Link
                key={c.id}
                to={`/shop?category=${c.slug}`}
                className="group flex flex-col items-center gap-3 rounded-2xl bg-surface-pure p-5 text-center shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-subtle text-secondary transition-colors group-hover:bg-secondary-fixed/30">
                  <Icon name={meta.icon} className="text-3xl transition-transform group-hover:scale-110" />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-sm font-semibold text-primary group-hover:text-secondary">{c.name}</span>
                  {meta.subtitle && <span className="mt-0.5 text-xs text-muted">{meta.subtitle}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
