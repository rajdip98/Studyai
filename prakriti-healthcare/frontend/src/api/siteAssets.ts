import { api } from "./client";
import type { SiteAssetType } from "./admin";

export interface PublicSiteAsset {
  id: string;
  type: SiteAssetType;
  url: string;
  altText?: string | null;
  sortOrder: number;
}

export function listPublicSiteAssets(type: SiteAssetType) {
  return api.get<{ assets: PublicSiteAsset[] }>(`/api/site-assets?type=${type}`);
}
