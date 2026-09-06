import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "", label: "Dashboard", end: true },
  { to: "banners", label: "Homepage Banners" },
  { to: "promo-banners", label: "Promo Banners" },
  { to: "posters", label: "Posters" },
  { to: "payment-qr", label: "Payment QR Code" },
  { to: "products", label: "Products & Images" },
  { to: "password", label: "Change Password" },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-surface-subtle">
      <aside className="w-64 flex-shrink-0 border-r border-border-earth bg-surface-pure">
        <div className="p-5">
          <p className="font-serif text-lg font-semibold text-primary">Prakriti Admin</p>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-base px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-primary text-white" : "text-charcoal hover:bg-surface-subtle"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-8 px-3">
          <button
            className="w-full rounded-base px-3 py-2 text-left text-sm font-medium text-sale hover:bg-surface-subtle"
            onClick={async () => {
              await logout();
              navigate("/site/in/admin");
            }}
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
