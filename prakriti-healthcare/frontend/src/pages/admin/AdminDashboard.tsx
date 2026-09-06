import { Link } from "react-router-dom";

const cards = [
  { to: "banners", label: "Homepage Banners", hint: "Hero images shown at the top of the storefront" },
  { to: "promo-banners", label: "Promo Banners", hint: "Secondary promotional strips" },
  { to: "posters", label: "Posters", hint: "Campaign / seasonal posters" },
  { to: "payment-qr", label: "Payment QR Code", hint: "UPI QR code shown at checkout" },
  { to: "products", label: "Products & Images", hint: "Manage the catalog and product photos" },
  { to: "password", label: "Change Password", hint: "Rotate the admin panel password" },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Manage everything shown on the storefront from here.</p>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="card block p-5 hover:shadow-level2">
            <p className="font-semibold">{c.label}</p>
            <p className="mt-1 text-sm text-muted">{c.hint}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
