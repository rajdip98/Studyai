import {
  Accessibility,
  ArrowRight,
  Award,
  Bandage,
  BadgeCheck,
  Brain,
  Camera,
  Dumbbell,
  FlaskConical,
  Flower2,
  Footprints,
  Globe,
  Headphones,
  Heart,
  HeartPulse,
  Leaf,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  PersonStanding,
  Phone,
  Pill,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  StarHalf,
  Truck,
  User,
  UtensilsCrossed,
  Wheat,
  X,
  type LucideIcon,
} from "lucide-react";

// Maps the Google Material Symbols icon names used throughout the design
// (e.g. "local_shipping", "favorite") to their closest lucide-react
// equivalent. We render real inline SVGs rather than a ligature icon font —
// a ligature font silently falls back to showing its raw name as text
// ("favorite" instead of a heart) whenever it fails or is slow to load
// (flaky networks, ad blockers, corporate firewalls, blocked font CDNs),
// which is a real production risk for something used on every page.
const ICON_MAP: Record<string, LucideIcon> = {
  local_shipping: Truck,
  call: Phone,
  mail: Mail,
  public: Globe,
  photo_camera: Camera,
  chat: MessageCircle,
  person: User,
  favorite: Heart,
  search: Search,
  shopping_bag: ShoppingBag,
  shopping_cart: ShoppingCart,
  add_shopping_cart: ShoppingCart,
  arrow_forward: ArrowRight,
  verified: BadgeCheck,
  verified_user: ShieldCheck,
  eco: Leaf,
  science: FlaskConical,
  shield_moon: ShieldCheck,
  accessibility_new: Accessibility,
  self_improvement: PersonStanding,
  monitor_heart: HeartPulse,
  restaurant: UtensilsCrossed,
  star: Star,
  star_half: StarHalf,
  spa: Flower2,
  psychology_alt: Brain,
  medication: Pill,
  agriculture: Wheat,
  inventory_2: Package,
  workspace_premium: Award,
  support_agent: Headphones,
  lock: Lock,
  close: X,
  location_on: MapPin,
  sports_gymnastics: Dumbbell,
  directions_walk: Footprints,
  healing: Bandage,
};

interface IconProps {
  name: keyof typeof ICON_MAP | string;
  className?: string;
  /** Fills the icon (e.g. a solid star rating) instead of the default outline. */
  filled?: boolean;
}

export default function Icon({ name, className = "", filled = false }: IconProps) {
  const LucideComponent = ICON_MAP[name] ?? Leaf;
  return (
    // Sized in `em` units (not lucide's default 24px) so existing Tailwind
    // text-size classes (text-sm, text-2xl, ...) passed via `className`
    // control the icon's size exactly the way they'd control glyph size on
    // a font — no need to translate every call site to w-/h- utilities.
    <LucideComponent
      className={`inline-block h-[1em] w-[1em] shrink-0 align-[-0.125em] ${className}`}
      aria-hidden="true"
      fill={filled ? "currentColor" : "none"}
      strokeWidth={filled ? 0 : 2}
    />
  );
}
