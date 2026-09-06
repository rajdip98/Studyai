import { useEffect, useState } from "react";
import { adminApi } from "../../api/admin";
import { listCategories } from "../../api/products";
import { ApiError } from "../../api/client";
import type { Category, Product } from "../../api/types";
import { formatPaise } from "../../api/types";

interface FormState {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  price: string; // rupees, as typed
  mrp: string;
  stockQuantity: string;
  sku: string;
  isActive: boolean;
  categoryId: string;
  images: string[];
}

const emptyForm: FormState = {
  slug: "",
  name: "",
  subtitle: "",
  description: "",
  price: "",
  mrp: "",
  stockQuantity: "0",
  sku: "",
  isActive: true,
  categoryId: "",
  images: [],
};

// Turns "My New Product!" into "my-new-product" so admin-created products
// always get a usable URL slug, even if never manually edited.
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    adminApi
      .listProducts()
      .then((r) => setProducts(r.items))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  useEffect(() => {
    listCategories().then((r) => setCategories(r.categories));
  }, []);

  function startCreate() {
    setEditingSlug("__new__");
    setForm(emptyForm);
    setSlugTouched(false);
    setError(null);
  }

  function startEdit(p: Product) {
    setEditingSlug(p.slug);
    setForm({
      slug: p.slug,
      name: p.name,
      subtitle: p.subtitle ?? "",
      description: p.description,
      price: (p.priceInPaise / 100).toString(),
      mrp: (p.mrpInPaise / 100).toString(),
      stockQuantity: p.stockQuantity.toString(),
      sku: p.sku ?? "",
      isActive: p.isActive ?? true,
      categoryId: p.category?.id ?? "",
      images: p.images,
    });
    setSlugTouched(true);
    setError(null);
  }

  function handleNameChange(name: string) {
    setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await adminApi.uploadImage(file);
      setForm((f) => ({ ...f, images: [...f.images, url] }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(url: string) {
    setForm((f) => ({ ...f, images: f.images.filter((i) => i !== url) }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const slug = slugify(form.slug) || slugify(form.name);
      if (!slug) throw new ApiError(400, "INVALID_SLUG", "Please enter a product name or slug.");

      const payload = {
        slug,
        name: form.name.trim(),
        subtitle: form.subtitle.trim() || undefined,
        description: form.description.trim(),
        priceInPaise: Math.round(Number(form.price) * 100),
        mrpInPaise: Math.round(Number(form.mrp) * 100),
        stockQuantity: Number(form.stockQuantity),
        sku: form.sku.trim(),
        isActive: form.isActive,
        categoryId: form.categoryId || null,
        images: form.images,
      };

      if (editingSlug === "__new__") {
        await adminApi.createProduct(payload);
      } else if (editingSlug) {
        await adminApi.updateProduct(editingSlug, payload);
      }
      setEditingSlug(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save product.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(p: Product) {
    await adminApi.updateProduct(p.slug, { isActive: !p.isActive });
    load();
  }

  if (editingSlug) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-serif text-2xl font-semibold">
          {editingSlug === "__new__" ? "New Product" : `Edit: ${form.name}`}
        </h1>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <input
              className="input-field"
              placeholder="Product name"
              required
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
            <input
              className="input-field"
              placeholder="Slug (url-friendly)"
              required
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setForm({ ...form, slug: e.target.value });
              }}
            />
          </div>
          <input className="input-field" placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          <textarea className="input-field !h-28" placeholder="Description" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-3 gap-4">
            <input className="input-field" type="number" min="0" step="1" placeholder="Price (Rs.)" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <input className="input-field" type="number" min="0" step="1" placeholder="MRP (Rs.)" required value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} />
            <input className="input-field" type="number" min="0" step="1" placeholder="Stock qty" required value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input className="input-field" placeholder="SKU" required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            <select
              className="input-field"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Visible on storefront
          </label>

          <div>
            <p className="mb-2 text-sm font-medium">Product Images</p>
            <div className="flex flex-wrap gap-3">
              {form.images.map((url) => (
                <div key={url} className="relative h-20 w-20 overflow-hidden rounded-base border border-border-earth">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    className="absolute right-0 top-0 bg-sale px-1 text-xs text-white"
                    onClick={() => removeImage(url)}
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-base border border-dashed border-border-earth text-xs text-muted">
                {uploading ? "…" : "+ Add"}
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-sale">{error}</p>}
          <div className="flex gap-3">
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save Product"}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setEditingSlug(null)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold">Products</h1>
        <button className="btn-primary" onClick={startCreate}>
          + New Product
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-muted">Loading products…</p>}
        {!loading &&
          products.map((p) => (
            <div key={p.id} className="card flex items-center gap-4 p-3">
              <div className="h-14 w-14 flex-shrink-0 rounded-base bg-surface-subtle">
                {p.images[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1">
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-muted">
                  {formatPaise(p.priceInPaise)} · Stock: {p.stockQuantity}
                  {p.category ? ` · ${p.category.name}` : ""}
                </p>
              </div>
              <button className="text-sm font-medium text-primary" onClick={() => toggleActive(p)}>
                {p.isActive ? "Active" : "Hidden"}
              </button>
              <button className="text-sm font-medium" onClick={() => startEdit(p)}>
                Edit
              </button>
            </div>
          ))}
        {!loading && products.length === 0 && <p className="text-sm text-muted">No products yet.</p>}
      </div>
    </div>
  );
}
