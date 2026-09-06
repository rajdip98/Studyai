import { Link } from "react-router-dom";
import Icon from "./Icon";

export default function Footer() {
  return (
    <footer className="mt-16 w-full bg-surface-cream pb-8 pt-16 text-charcoal shadow-[0_-1px_8px_rgba(0,0,0,0.02)]">
      <div className="container mx-auto">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col gap-2 lg:col-span-2 lg:pr-4">
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold text-primary">PRAKRITI HEALTHCARE</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-gold-dark">
                Keeping Mankind Healthy
              </span>
            </div>
            <p className="mt-2 leading-relaxed text-muted">
              Dedicated to restoring physical harmony and longevity through pure, clinically tested Ayurvedic herbs
              and authentic botanical formulations.
            </p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-charcoal/80">
              <div className="flex items-center gap-2">
                <Icon name="call" className="text-base text-primary" />
                <span>+91 9665496199</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="mail" className="text-base text-primary" />
                <span>prakritihealthcare24@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="location_on" className="text-base text-primary" />
                <span>Ayurvedic Research Center, Maharashtra, India</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-serif text-sm font-semibold text-primary">Quick Links</h3>
            <ul className="flex flex-col gap-2 text-sm text-charcoal/80">
              <li><Link to="/" className="hover:text-primary">Home</Link></li>
              <li><Link to="/shop" className="hover:text-primary">All Products</Link></li>
              <li><Link to="/shop?bestseller=true" className="hover:text-primary">Bestsellers</Link></li>
              <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary">Contact Us</Link></li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-serif text-sm font-semibold text-primary">Customer Care</h3>
            <ul className="flex flex-col gap-2 text-sm text-charcoal/80">
              <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-primary">Privacy Policy</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-primary">Refund &amp; Cancellation</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-primary">Shipping Policy</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-primary">Terms &amp; Conditions</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-primary">Help &amp; FAQs</a></li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-serif text-sm font-semibold text-primary">Newsletter</h3>
            <p className="text-sm text-muted">Get updates on new launches &amp; exclusive deals.</p>
            <form className="mt-1" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full rounded-lg bg-surface-pure px-3 py-2 text-sm shadow-sm placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="absolute bottom-1 right-1 top-1 rounded bg-primary px-3 text-xs font-semibold text-white transition-colors hover:bg-primary-dark"
                >
                  Join
                </button>
              </div>
              <span className="mt-2 block text-xs text-muted">100% natural updates. Zero spam.</span>
            </form>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border-earth pt-6 text-xs text-muted md:flex-row">
          <p>© {new Date().getFullYear()} Prakriti Healthcare. All rights reserved. Keeping Mankind Healthy.</p>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase text-muted">Secure Payments</span>
            <div className="flex items-center gap-1.5">
              {["UPI", "Cards", "NetBanking", "COD"].map((m) => (
                <span key={m} className="rounded bg-surface-pure px-2 py-1 text-xs font-semibold shadow-sm">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
