import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addressesApi, ordersApi } from "../api/orders";
import type { Address } from "../api/types";
import { useCart } from "../context/CartContext";
import { formatPaise } from "../api/types";
import { ApiError } from "../api/client";
import { listPublicSiteAssets, type PublicSiteAsset } from "../api/siteAssets";

export default function Checkout() {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", line1: "", city: "", state: "", postalCode: "" });
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [paymentQr, setPaymentQr] = useState<PublicSiteAsset | null>(null);

  useEffect(() => {
    addressesApi.list().then((r) => {
      setAddresses(r.addresses);
      const def = r.addresses.find((a) => a.isDefault) ?? r.addresses[0];
      if (def) setSelectedAddressId(def.id);
      else setShowNewAddress(true);
    });
    listPublicSiteAssets("PAYMENT_QR").then((r) => setPaymentQr(r.assets[0] ?? null));
  }, []);

  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, i) => sum + i.product.priceInPaise * i.quantity, 0);

  async function handlePlaceOrder() {
    setError(null);
    setPlacing(true);
    try {
      let addressId = selectedAddressId;
      if (showNewAddress) {
        const { address } = await addressesApi.create({ ...form, isDefault: addresses.length === 0 });
        addressId = address.id;
      }
      if (!addressId) throw new Error("Please select or add a delivery address.");

      // A stable idempotency key per checkout attempt prevents duplicate
      // orders if the network retries or the user double-clicks.
      const idempotencyKey = `checkout-${addressId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const { order } = await ordersApi.create(addressId, idempotencyKey);
      await refreshCart();
      navigate(`/order-confirmation/${order.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return <div className="container py-20 text-center text-muted">Your cart is empty.</div>;
  }

  return (
    <div className="container grid gap-10 py-12 md:grid-cols-3">
      <div className="space-y-6 md:col-span-2">
        <h1 className="font-serif text-2xl font-semibold">Delivery Address</h1>

        {addresses.map((a) => (
          <label key={a.id} className="card flex cursor-pointer gap-3 p-4">
            <input
              type="radio"
              name="address"
              checked={selectedAddressId === a.id && !showNewAddress}
              onChange={() => {
                setSelectedAddressId(a.id);
                setShowNewAddress(false);
              }}
            />
            <div className="text-sm">
              <p className="font-medium">{a.fullName}</p>
              <p className="text-muted">
                {a.line1}, {a.city}, {a.state} {a.postalCode}
              </p>
              <p className="text-muted">{a.phone}</p>
            </div>
          </label>
        ))}

        <button className="text-sm font-medium text-primary" onClick={() => setShowNewAddress((s) => !s)}>
          {showNewAddress ? "Cancel" : "+ Add a new address"}
        </button>

        {showNewAddress && (
          <div className="card grid gap-3 p-4">
            <input className="input-field" placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <input className="input-field" placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="input-field" placeholder="Address line" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
            <div className="grid grid-cols-3 gap-3">
              <input className="input-field" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <input className="input-field" placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              <input className="input-field" placeholder="PIN code" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
            </div>
          </div>
        )}
      </div>

      <div className="card h-fit space-y-3 p-6">
        <h2 className="font-semibold">Order Summary</h2>
        {items.map((i) => (
          <div key={i.id} className="flex justify-between text-sm">
            <span>
              {i.product.name} × {i.quantity}
            </span>
            <span>{formatPaise(i.product.priceInPaise * i.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-border-earth pt-3 font-semibold">
          <span>Total</span>
          <span>{formatPaise(subtotal)}</span>
        </div>
        {error && <p className="text-sm text-sale">{error}</p>}
        <button className="btn-primary w-full" onClick={handlePlaceOrder} disabled={placing}>
          {placing ? "Placing order…" : "Place Order"}
        </button>

        {paymentQr && (
          <div className="border-t border-border-earth pt-3 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Or pay via UPI</p>
            <img src={paymentQr.url} alt="UPI payment QR code" className="mx-auto mt-2 h-32 w-32 rounded-base border border-border-earth object-contain" />
          </div>
        )}
      </div>
    </div>
  );
}
