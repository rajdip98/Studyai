import Icon from "./Icon";

export default function AnnouncementTicker() {
  return (
    <div className="w-full select-none overflow-hidden border-b border-gold-light/40 bg-surface-cream py-2 text-charcoal">
      <div className="container mx-auto flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider">
        <div className="flex items-center gap-8 text-gold-dark">
          <span className="flex items-center gap-2">
            <Icon name="verified" className="text-sm text-leaf-vibrant" /> India&apos;s Trusted Herbal Wellness Brand
          </span>
          <span className="hidden opacity-40 md:inline-block">•</span>
          <span className="hidden items-center gap-2 md:flex">
            <Icon name="eco" className="text-sm text-leaf-vibrant" /> Premium Herbal Wellness for a Healthier Tomorrow
          </span>
          <span className="hidden opacity-40 lg:inline-block">•</span>
          <span className="hidden items-center gap-2 lg:flex">
            <Icon name="science" className="text-sm text-leaf-vibrant" /> 100% Ayurvedic Research Formulations
          </span>
        </div>
        <div className="flex items-center gap-2 font-bold text-primary">
          <Icon name="local_shipping" className="text-sm text-gold-dark" />
          <span>Free Shipping Across India</span>
        </div>
      </div>
    </div>
  );
}
