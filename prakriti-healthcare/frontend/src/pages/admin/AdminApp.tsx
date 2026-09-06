import { Route, Routes } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AdminLogin from "./AdminLogin";
import AdminLayout from "./AdminLayout";
import AdminDashboard from "./AdminDashboard";
import AssetManager from "./AssetManager";
import AdminProducts from "./AdminProducts";
import AdminChangePassword from "./AdminChangePassword";

// Guards the entire /site/in/admin subtree: an unauthenticated visitor (or
// one who is authenticated but not an ADMIN) only ever sees the password
// gate — never the panel's nested routes or any data they'd fetch.
export default function AdminApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted">Loading…</div>;
  }

  if (!user || user.role !== "ADMIN") {
    return <AdminLogin />;
  }

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route
          path="banners"
          element={<AssetManager type="HERO_BANNER" title="Homepage Banners" description="Full-width hero images shown at the top of the homepage." />}
        />
        <Route
          path="promo-banners"
          element={<AssetManager type="PROMO_BANNER" title="Promo Banners" description="Secondary promotional banners shown across the storefront." />}
        />
        <Route
          path="posters"
          element={<AssetManager type="POSTER" title="Posters" description="Campaign and seasonal poster images." />}
        />
        <Route
          path="payment-qr"
          element={<AssetManager type="PAYMENT_QR" title="Payment QR Code" description="The UPI QR code shown to customers at checkout." />}
        />
        <Route path="products" element={<AdminProducts />} />
        <Route path="password" element={<AdminChangePassword />} />
      </Route>
    </Routes>
  );
}
