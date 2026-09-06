import Icon from "./Icon";

const reviews = [
  {
    initials: "AS",
    name: "Arjun S.",
    place: "Pune, Maharashtra",
    body: "Maine bahut saare wellness brands try kiye hain, lekin Prakriti Healthcare apna quality aur professionalism me alag hi stand karta hai. Bone Relief ne 3 hafte me hi knees ka pain gayab kar diya!",
    avatarBg: "bg-primary",
  },
  {
    initials: "AG",
    name: "Anjali G.",
    place: "Jaipur, Rajasthan",
    body: "Maine Prakriti Healthcare ko apni poori family ko recommend kiya hai. Inke Divyasakhi syrup aur capsules ki quality bahut hi authentic hai. Hormonal balance me sach me natural support mila.",
    avatarBg: "bg-gold-dark",
  },
  {
    initials: "SK",
    name: "Sneha K.",
    place: "Bengaluru, Karnataka",
    body: "Online reviews padhne ke baad maine Healthcare se order kiya tha. Packing was superb and delivery within 2 days. 100% pure herbal formulation, no stomach irritation at all!",
    avatarBg: "bg-secondary",
  },
  {
    initials: "NP",
    name: "Neha P.",
    place: "Delhi NCR",
    body: "Mujhe inke natural ingredients aur quality par diya gaya dhyan bahut pasand aaya. Aaj ke time me bina chemical ke aise results milna bahut mushkil hota hai.",
    avatarBg: "bg-primary-container",
  },
  {
    initials: "GS",
    name: "Girish S.",
    place: "Ahmedabad, Gujarat",
    body: "Ghutne ke dard me bahut aaram mila. Regular usage ke 15 dino baad chalne firne me asani hone lagi hai. Sach me Ayurvedic asar dikhata hai.",
    avatarBg: "bg-primary-dark",
  },
];

function Stars({ half }: { half?: boolean }) {
  return (
    <div className="flex text-gold-dark">
      {Array.from({ length: 4 }).map((_, i) => (
        <Icon key={i} name="star" filled className="text-lg" />
      ))}
      <Icon name={half ? "star_half" : "star"} filled className="text-lg" />
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="w-full bg-surface py-16">
      <div className="container mx-auto">
        <div className="mx-auto mb-12 max-w-xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-surface-cream px-4 py-1.5">
            <Stars half />
            <span className="text-xs font-bold text-primary">4.6 Star Rated from 8,500+ Verified Buyers</span>
          </div>
          <h2 className="font-serif text-3xl font-semibold text-primary">Our Customers Love Us</h2>
          <p className="mt-2 text-sm text-muted">Authentic patient stories and health transformations shared across India.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <div key={r.name} className="flex flex-col justify-between rounded-2xl bg-surface-cream p-6 shadow-sm">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <Stars />
                  <span className="flex items-center gap-1 text-xs font-semibold text-leaf-vibrant">
                    <Icon name="verified" className="text-sm" /> Verified Buyer
                  </span>
                </div>
                <p className="italic leading-relaxed text-charcoal">&ldquo;{r.body}&rdquo;</p>
              </div>
              <div className="mt-6 flex items-center gap-3 border-t border-gold-light/40 pt-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${r.avatarBg}`}>
                  {r.initials}
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-sm font-semibold text-primary">{r.name}</span>
                  <span className="text-xs text-muted">{r.place}</span>
                </div>
              </div>
            </div>
          ))}

          <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-primary p-6 text-white shadow-sm">
            <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-gold-dark/20 blur-xl" />
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gold-light">Community Trust</span>
              <h3 className="mt-2 font-serif text-xl font-semibold">Join 15,000+ Thriving Families</h3>
              <p className="mt-2 text-sm text-white/80">
                Experience the difference of non-synthetic Ayurvedic purity backed by genuine care.
              </p>
            </div>
            <div className="mt-6 border-t border-white/20 pt-4">
              <a
                href="#reviews"
                onClick={(e) => e.preventDefault()}
                className="block rounded-xl bg-gold-light py-2.5 text-center text-sm font-bold text-charcoal transition-colors hover:bg-gold"
              >
                Read All Verified Stories
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
