const badges = [
  { title: "25+ Years Herbal Wisdom" },
  { title: "Triple Tested Quality & Safety" },
  { title: "Modern Research Backed" },
  { title: "100% Whole-Herb Extracts" },
  { title: "2,200+ Farmers Empowered" },
  { title: "800+ Natural Formulations" },
];

export default function TrustBadges() {
  return (
    <section className="bg-primary py-14 text-white">
      <div className="container">
        <p className="text-xs font-semibold uppercase tracking-widest text-secondary">Scientific Rigor · Ancient Wisdom</p>
        <h2 className="mt-2 max-w-xl font-serif text-3xl font-semibold">Keeping Mankind Healthy, Naturally.</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-6">
          {badges.map((b) => (
            <div key={b.title} className="rounded-base border border-white/15 bg-white/5 p-4 text-center text-sm">
              {b.title}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
