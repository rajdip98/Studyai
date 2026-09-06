import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-border-earth bg-surface-pure/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-serif text-xl font-semibold text-primary">
          Prakriti Healthcare
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-charcoal md:flex">
          <Link to="/shop">All Products</Link>
          <Link to="/shop?bestseller=true">Bestsellers</Link>
          <Link to="/about">Our Story</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/account/orders" className="text-sm font-medium">
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
            <Link to="/login" className="text-sm font-medium">
              Login / Register
            </Link>
          )}
          <Link to="/cart" className="btn-secondary !h-10 !px-4 text-sm">
            Cart{itemCount > 0 ? ` (${itemCount})` : ""}
          </Link>
        </div>
      </div>
    </header>
  );
}
