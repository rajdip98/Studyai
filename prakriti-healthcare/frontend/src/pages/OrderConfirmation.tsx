import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ordersApi } from "../api/orders";
import type { Order } from "../api/types";
import { formatPaise } from "../api/types";

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    ordersApi
      .get(id)
      .then((r) => setOrder(r.order))
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="container max-w-lg py-20 text-center">
        <h1 className="font-serif text-2xl font-semibold">Order not found</h1>
        <p className="mt-2 text-muted">We couldn't find that order. It may belong to a different account.</p>
        <Link to="/account/orders" className="btn-primary mt-8 inline-flex">
          View My Orders
        </Link>
      </div>
    );
  }

  if (!order) return <div className="container py-20 text-center text-muted">Loading…</div>;

  return (
    <div className="container max-w-lg py-20 text-center">
      <h1 className="font-serif text-2xl font-semibold text-primary">Order placed!</h1>
      <p className="mt-2 text-muted">
        Order <strong>{order.orderNumber}</strong> — total {formatPaise(order.totalInPaise)}
      </p>
      <p className="mt-1 text-sm text-muted">Status: {order.status}</p>
      <Link to="/account/orders" className="btn-primary mt-8 inline-flex">
        View My Orders
      </Link>
    </div>
  );
}
