import Icon from "./Icon";

const stats = [
  { icon: "spa", value: "25+", label: "Years Herbal Wellness" },
  { icon: "verified", value: "Triple", label: "Tested Quality & Safety" },
  { icon: "psychology_alt", value: "Modern", label: "Research Backed" },
  { icon: "medication", value: "100%", label: "Whole-Herb Filler-Free" },
  { icon: "agriculture", value: "2,200+", label: "Farmers Empowered" },
  { icon: "inventory_2", value: "800+", label: "Natural Formulations" },
];

const pillars = [
  {
    icon: "workspace_premium",
    title: "High Quality Brand",
    body: "Curated for clinical potency, purity, and long-term shelf vitality.",
  },
  {
    icon: "support_agent",
    title: "24/7 Expert Support",
    body: "Real-time consultation with Ayurvedic vaidyas & counselors.",
  },
  {
    icon: "local_shipping",
    title: "Fast Shipping",
    body: "Dispatched within 24 hours. Free on prepaid orders above ₹999.",
  },
  {
    icon: "lock",
    title: "Secure Payments",
    body: "All major Cards, UPI, NetBanking and COD fully protected.",
  },
];

export default function TrustBadges() {
  return (
    <section className="relative w-full overflow-hidden bg-primary-container py-16 text-white">
      <div className="container relative z-10 mx-auto">
        <div className="mb-12 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="flex flex-col gap-2 lg:col-span-5">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-light">
              Scientific Rigor · Ancient Wisdom
            </span>
            <h2 className="font-serif text-3xl font-semibold leading-tight">Keeping Mankind Healthy, Naturally.</h2>
            <p className="leading-relaxed text-white/80">
              Our wellness paradigm bridges traditional Rasayana philosophy with rigorous contemporary clinical
              standardization. Zero heavy metals, zero synthetic binders, zero shortcuts.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:col-span-7">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-2 rounded-2xl bg-white/10 p-5 text-center backdrop-blur-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-dark text-gold-light">
                  <Icon name={s.icon} className="text-2xl" />
                </div>
                <span className="font-serif text-xl font-bold">{s.value}</span>
                <span className="text-xs text-white/80">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 border-t border-white/20 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => (
            <div key={p.title} className="flex items-start gap-4">
              <div className="shrink-0 rounded-xl bg-primary-dark p-3 text-gold-light">
                <Icon name={p.icon} className="text-2xl" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-semibold">{p.title}</h4>
                <p className="mt-1 text-xs text-white/80">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
