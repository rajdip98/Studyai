export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border-earth bg-primary text-white">
      <div className="container grid gap-10 py-16 md:grid-cols-4">
        <div>
          <h3 className="font-serif text-lg font-semibold">Prakriti Healthcare</h3>
          <p className="mt-3 text-sm text-white/70">
            Dedicated to restoring physical harmony and longevity through pure, clinically-tested Ayurvedic
            and authentic botanical formulations.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white/80">Quick Links</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>Home</li>
            <li>All Products</li>
            <li>New Arrivals</li>
            <li>Bestsellers</li>
            <li>About Us</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white/80">Customer Care</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>Privacy Policy</li>
            <li>Refund &amp; Cancellation</li>
            <li>Shipping Policy</li>
            <li>Terms &amp; Conditions</li>
            <li>Help &amp; FAQs</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white/80">Newsletter</h4>
          <p className="mt-3 text-sm text-white/70">Get updates on new launches and Live Ayurvedic wellness tips.</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} Prakriti Healthcare. All rights reserved.
      </div>
    </footer>
  );
}
