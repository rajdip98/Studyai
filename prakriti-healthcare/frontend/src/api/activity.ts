import { api } from "./client";

export interface RecentActivity {
  productName: string;
  createdAt: string;
}

export function getRecentActivity() {
  return api.get<{ activity: RecentActivity | null }>("/api/activity/recent");
}
