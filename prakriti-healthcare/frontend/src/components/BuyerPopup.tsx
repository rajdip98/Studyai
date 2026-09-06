import { useEffect, useState } from "react";
import { getRecentActivity } from "../api/activity";
import Icon from "./Icon";

function relativeTime(iso: string): string {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/**
 * Shows a "someone just bought this" notice — but only backed by a real
 * recent order (see backend/src/modules/orders/activity.public.routes.ts).
 * No customer name or location is ever shown, and nothing renders at all
 * if there's no genuine recent order, rather than fabricating one.
 */
export default function BuyerPopup() {
  const [activity, setActivity] = useState<{ productName: string; createdAt: string } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    getRecentActivity()
      .then((r) => setActivity(r.activity))
      .catch(() => setActivity(null));
  }, []);

  if (!activity || dismissed) return null;

  return (
    <aside className="fixed bottom-6 left-6 z-40 flex max-w-sm items-center gap-3.5 rounded-2xl border border-gold-light/40 bg-surface-pure/95 p-3.5 shadow-xl backdrop-blur-md">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-surface-subtle">
        <Icon name="shopping_bag" className="text-2xl text-primary" />
      </div>
      <div className="flex min-w-0 flex-col pr-6">
        <span className="flex items-center gap-1 text-xs text-muted">
          <span className="h-2 w-2 rounded-full bg-leaf-vibrant" />
          Recently purchased
        </span>
        <span className="truncate font-serif text-sm font-bold text-primary">{activity.productName}</span>
        <span className="mt-0.5 text-[11px] text-muted">{relativeTime(activity.createdAt)}</span>
      </div>
      <button
        aria-label="Close notification"
        className="absolute right-2 top-2 p-1 text-muted hover:text-charcoal"
        onClick={() => setDismissed(true)}
      >
        <Icon name="close" className="text-sm" />
      </button>
    </aside>
  );
}
