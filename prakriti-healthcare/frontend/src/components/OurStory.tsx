import { Link } from "react-router-dom";
import Icon from "./Icon";

export default function OurStory() {
  return (
    <section className="w-full bg-surface-cream py-16">
      <div className="container mx-auto grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <div className="flex flex-col items-start gap-3 lg:col-span-7">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">Our Heritage · Our Mission</span>
          <h2 className="font-serif text-3xl font-semibold leading-tight text-primary">
            Our Story: Caring Beyond Products, Inspired by Nature
          </h2>
          <div className="mt-2 space-y-4 leading-relaxed text-on-surface-variant">
            <p>
              Every journey begins with a reason and ours began with a simple belief:{" "}
              <strong className="text-primary">good health should come from nature, not compromise</strong>. At
              Prakriti Healthcare, we are inspired by the timeless wisdom of Ayurveda and driven by a genuine desire
              to help people live healthier, happier lives.
            </p>
            <p>
              We believe wellness is more than treating problems; it is about restoring balance, building trust, and
              caring for every family as if they were our own. Every formula we create reflects our commitment to
              purity, quality, and integrity.
            </p>
            <p>
              We don&apos;t just make products — we create solutions with purpose, guided by nature and backed by
              thoughtful research. Because when your health improves, your life changes, and that is the difference
              we strive to make every single day.
            </p>
          </div>

          <div className="mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl bg-surface-pure p-4 shadow-sm">
              <Icon name="call" className="text-2xl text-secondary" />
              <div className="flex flex-col">
                <span className="text-xs text-muted">Direct Helpline</span>
                <a className="font-semibold text-primary hover:text-secondary" href="tel:+919665496199">
                  +91 96654 96199
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-surface-pure p-4 shadow-sm">
              <Icon name="mail" className="text-2xl text-secondary" />
              <div className="flex min-w-0 flex-col">
                <span className="text-xs text-muted">Consultation Desk</span>
                <a
                  className="truncate font-semibold text-primary hover:text-secondary"
                  href="mailto:prakritihealthcare24@gmail.com"
                >
                  prakritihealthcare24@gmail.com
                </a>
              </div>
            </div>
          </div>

          <Link to="/about" className="btn-primary mt-2">
            <span>READ FULL HERITAGE</span>
            <Icon name="arrow_forward" className="text-base" />
          </Link>
        </div>

        <div className="flex flex-col items-center lg:col-span-5">
          <div className="w-full overflow-hidden rounded-3xl bg-surface-pure p-3 shadow-2xl">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-primary-container via-primary to-primary-dark">
              <div className="flex h-full items-center justify-center">
                <Icon name="spa" className="text-6xl text-gold-light/60" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                <div>
                  <span className="block font-serif text-sm font-bold">Founding Visionaries</span>
                  <span className="text-xs text-gold-light">Prakriti Healthcare Research Center</span>
                </div>
                <Icon name="verified" className="text-2xl text-gold-light" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 text-xs text-muted">
              <span>Maharashtra, India</span>
              <span className="flex items-center gap-1 font-semibold text-leaf-vibrant">
                <Icon name="eco" className="text-sm" /> 100% Ethical Sourcing
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
