import { useEffect, useState } from "react";
import { ordersApi } from "../api/orders";
import type { Order } from "../api/types";
import { formatPaise } from "../api/types";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi
      .list()
      .then((r) => setOrders(r.orders))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-12">
      <h1 className="font-serif text-2xl font-semibold">My Orders</h1>
      {loading ? (
        <p className="mt-6 text-muted">Loading your orders…</p>
      ) : orders.length === 0 ? (
        <p className="mt-6 text-muted">You haven't placed any orders yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="card p-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{o.orderNumber}</span>
                <span className="text-muted">{new Date(o.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="mt-1 flex justify-between text-sm">
                <span className="text-muted">{o.status}</span>
                <span className="font-semibold">{formatPaise(o.totalInPaise)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
