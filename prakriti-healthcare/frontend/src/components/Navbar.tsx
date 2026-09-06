import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Icon from "./Icon";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "All Products" },
  { to: "/shop?bestseller=true", label: "Bestsellers" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact Us" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
  }

  return (
    <header className="sticky top-0 z-50 bg-surface-pure/95 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      {/* Top contact/social strip */}
      <div className="bg-primary px-4 py-1.5 text-white lg:px-6">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-wider md:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="flex items-center gap-1">
              <Icon name="local_shipping" className="text-sm" />
              Free Shipping For All Orders
            </span>
            <span className="opacity-40">|</span>
            <a className="flex items-center gap-1 transition-colors hover:text-gold-light" href="tel:+919665496199">
              <Icon name="call" className="text-sm" />
              +91 9665496199
            </a>
            <span className="opacity-40">|</span>
            <a
              className="flex items-center gap-1 transition-colors hover:text-gold-light"
              href="mailto:prakritihealthcare24@gmail.com"
            >
              <Icon name="mail" className="text-sm" />
              prakritihealthcare24@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span className="opacity-80">Follow Us:</span>
            <div className="flex items-center gap-1.5">
              {["public", "photo_camera", "chat"].map((icon) => (
                <a
                  key={icon}
                  href="#"
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-gold-dark"
                  onClick={(e) => e.preventDefault()}
                >
                  <Icon name={icon} className="text-xs" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main nav row */}
      <div className="container mx-auto flex h-20 items-center justify-between gap-4">
        <Link to="/" className="flex shrink-0 flex-col">
          <span className="font-serif text-lg font-semibold tracking-wide text-primary">PRAKRITI HEALTHCARE</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">
            Keeping Mankind Healthy
          </span>
        </Link>

        <nav className="hidden items-center gap-6 xl:flex">
          {navLinks.map((link) => {
            const isBestsellerLink = link.to.includes("bestseller=true");
            const onBestsellerView = location.pathname === "/shop" && location.search.includes("bestseller=true");
            // "All Products" stays highlighted for any /shop browsing (e.g.
            // filtered by category) except the dedicated Bestsellers view,
            // rather than only matching the exact bare "/shop" URL.
            const isActive =
              link.to === "/"
                ? location.pathname === "/"
                : isBestsellerLink
                  ? onBestsellerView
                  : link.to === "/shop"
                    ? location.pathname === "/shop" && !onBestsellerView
                    : location.pathname === link.to;
            return (
              <Link
                key={link.label}
                to={link.to}
                className={`py-1 text-sm font-semibold transition-colors ${
                  isActive ? "border-b-2 border-primary text-primary" : "text-charcoal/80 hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <form onSubmit={submitSearch} className="relative hidden w-48 md:block lg:w-60">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search botanicals..."
              className="w-full rounded-full bg-surface-subtle py-1.5 pl-9 pr-3 text-sm placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Icon name="search" className="absolute left-2.5 top-2 text-lg text-muted" />
          </form>

          {user ? (
            <>
              <Link to="/account/orders" className="hidden text-sm font-medium sm:inline">
                My Orders
              </Link>
              <button
                className="text-sm font-medium text-muted hover:text-charcoal"
                onClick={async () => {
                  await logout();
                  navigate("/");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="hidden items-center gap-1 text-sm font-medium text-charcoal/80 hover:text-primary sm:flex"
            >
              <Icon name="person" className="text-lg" />
              <span>Login / Register</span>
            </Link>
          )}

          <button type="button" aria-label="Wishlist" className="relative p-1.5 text-charcoal/80 hover:text-primary">
            <Icon name="favorite" className="text-xl" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-surface-cream text-[10px] font-bold text-gold-dark">
              0
            </span>
          </button>

          <Link
            to="/cart"
            aria-label="Cart"
            className="flex items-center gap-1.5 rounded-full bg-primary-container px-3 py-1.5 text-white transition-colors hover:bg-primary-dark"
          >
            <Icon name="shopping_bag" className="text-lg" />
            <span className="hidden text-sm font-medium sm:inline">Cart</span>
            <span className="rounded-full bg-gold-light px-1.5 py-0.5 text-[11px] font-bold text-charcoal">
              {itemCount}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
