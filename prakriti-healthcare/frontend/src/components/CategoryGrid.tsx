import { Link } from "react-router-dom";
import type { Category } from "../api/types";

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="container py-14">
      <h2 className="text-center font-serif text-2xl font-semibold">Shop by Concern</h2>
      <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-6">
        {categories.map((c) => (
          <Link key={c.id} to={`/shop?category=${c.slug}`} className="flex flex-col items-center gap-2 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-subtle text-2xl">
              🌿
            </span>
            <span className="text-xs font-medium">{c.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
