import { useEffect, useState } from "react";
import { adminApi } from "../../api/admin";
import type { SiteAsset, SiteAssetType } from "../../api/admin";
import { ApiError } from "../../api/client";

interface Props {
  type: SiteAssetType;
  title: string;
  description: string;
}

export default function AssetManager({ type, title, description }: Props) {
  const [assets, setAssets] = useState<SiteAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    adminApi
      .listAssets(type)
      .then((r) => setAssets(r.assets))
      .finally(() => setLoading(false));
  }

  useEffect(load, [type]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { url, key } = await adminApi.uploadImage(file);
      await adminApi.createAsset({ type, url, key, sortOrder: assets.length });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function toggleActive(asset: SiteAsset) {
    await adminApi.updateAsset(asset.id, { isActive: !asset.isActive });
    load();
  }

  async function remove(asset: SiteAsset) {
    if (!window.confirm("Delete this image? This cannot be undone.")) return;
    await adminApi.deleteAsset(asset.id);
    load();
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold">{title}</h1>
      <p className="mt-1 text-sm text-muted">{description}</p>

      <label className="btn-secondary mt-6 inline-flex cursor-pointer">
        {uploading ? "Uploading…" : "Upload Image"}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          disabled={uploading}
          onChange={handleFileChange}
        />
      </label>
      {error && <p className="mt-2 text-sm text-sale">{error}</p>}

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {assets.map((asset) => (
          <div key={asset.id} className="card overflow-hidden">
            <div className="aspect-video bg-surface-subtle">
              <img src={asset.url} alt={asset.altText ?? ""} className="h-full w-full object-cover" />
            </div>
            <div className="flex items-center justify-between p-2 text-xs">
              <button className="font-medium text-primary" onClick={() => toggleActive(asset)}>
                {asset.isActive ? "Live" : "Hidden"}
              </button>
              <button className="font-medium text-sale" onClick={() => remove(asset)}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {loading && <p className="text-sm text-muted">Loading…</p>}
        {!loading && assets.length === 0 && <p className="text-sm text-muted">No images uploaded yet.</p>}
      </div>
    </div>
  );
}
