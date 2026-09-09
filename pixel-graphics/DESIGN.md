---
name: Pixel Chroma Print
colors:
  surface: '#00170f'
  surface-dim: '#00170f'
  surface-bright: '#243e34'
  surface-container-lowest: '#00120b'
  surface-container-low: '#052017'
  surface-container: '#09241b'
  surface-container-high: '#142f25'
  surface-container-highest: '#203a30'
  on-surface: '#cbe9db'
  on-surface-variant: '#e4bdc3'
  inverse-surface: '#cbe9db'
  inverse-on-surface: '#1b352c'
  outline: '#ab888e'
  outline-variant: '#5c3f45'
  surface-tint: '#ffb1c1'
  primary: '#ffb1c1'
  on-primary: '#66002a'
  primary-container: '#e60067'
  on-primary-container: '#fffdff'
  inverse-primary: '#bc0053'
  secondary: '#fff9ed'
  on-secondary: '#393000'
  secondary-container: '#fddc00'
  on-secondary-container: '#706000'
  tertiary: '#ffb691'
  on-tertiary: '#552000'
  tertiary-container: '#c35300'
  on-tertiary-container: '#fffdff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffd9df'
  primary-fixed-dim: '#ffb1c1'
  on-primary-fixed: '#3f0017'
  on-primary-fixed-variant: '#90003e'
  secondary-fixed: '#ffe24a'
  secondary-fixed-dim: '#e3c600'
  on-secondary-fixed: '#211b00'
  on-secondary-fixed-variant: '#524600'
  tertiary-fixed: '#ffdbcb'
  tertiary-fixed-dim: '#ffb691'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#793100'
  background: '#00170f'
  on-background: '#cbe9db'
  surface-variant: '#203a30'
typography:
  display-hero:
    fontFamily: Outfit
    fontSize: 56px
    fontWeight: '800'
    lineHeight: 64px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 38px
    fontWeight: '700'
    lineHeight: 46px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Outfit
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.04em
  label-md:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-xxs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4rem
  gutter-mobile: 1rem
  gutter-desktop: 1.5rem
  margin-mobile: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
---

## Brand & Style

This design system serves a modern, high-volume design and commercial print production studio. The brand embodies graphic craftsmanship, tactile material finishes, speed, and sharp visual precision. It bridges physical print collateral (banners, corporate stationery, flex, vinyl, apparel) with sleek digital order workflows, proof approvals, and portfolio showcases.

The audience consists of local business owners, event coordinators, corporate marketing teams, and creative directors needing reliable turnarounds with premium finish fidelity. The emotional tone is energetic, tactile, self-assured, and industrious.

The aesthetic fuses **High-Contrast Bold** with **Tactile / Skeuomorphic** craftsmanship: deep, saturated dark-emerald backgrounds evoke solid press beds and premium substrate stocks, while high-voltage magenta and canary yellow evoke fresh CMYK ink overlays. Crisp copper/amber plaques deliver physical workshop weight, paired with sharp modern geometric sans-serif typography.

## Colors

The palette directly references the vibrant ink-and-substrate contrast of the physical badge logo:

- **Primary (`#E60067`)**: Vivid Process Magenta. Used for high-impact call-to-actions, hero graphic accents, primary active states, and focal pricing tags.
- **Secondary (`#FFDE00`)**: Electric Process Yellow. Used for critical badges, key contact metrics, notification pips, and accent highlights against dark grounds.
- **Tertiary (`#E0681B`)**: Burnished Copper / Warm Orange. Represents physical metal badges, print stock framing, special service banners, and warm warning/notice states.
- **Neutral (`#0B261D`)**: Deep Forest Emerald. Serves as the deep base canvas. Surface variations scale from `#061812` (canvas base) to `#13382C` (card containers) and `#1B4A3B` (elevated press surfaces).

Text elements rely on pure crisp `#FFFFFF` for primary body/headings and `#D1E3DC` for secondary metadata, ensuring WCAG AAA legibility over the dark emerald ground.

## Typography

The typographic hierarchy combines punchy, modern geometric shapes with technical print precision:

- **Display & Headlines (`Outfit`)**: Clean, bold, and energetic geometric forms that match the high-volume personality of graphic printing without feeling corporate or cold.
- **Body (`Hanken Grotesk`)**: Exceptional readability at small and dense configurations, suited for itemized rate cards, spec sheets, material options, and service lists.
- **Technical & Labels (`Space Grotesk`)**: A monospaced/tech-grotesque hybrid used for phone numbers, pricing, SKU codes, resolution indicators (DPI, CMYK tags), and capsule labels.

High-impact typography in banners uses uppercase styling with tight line-heights mimicking embossed physical signage plates.

## Layout & Spacing

A 12-column fluid grid system anchors complex order calculators, service catalogs, and proof review modules on desktop (1280px+ max-width container), compressing to an 8-column layout on tablet (768px - 1024px) and a 4-column stack on mobile (<768px).

Spacing adheres strictly to a baseline 4px/8px modular rhythm:
- Micro-spacing (`4px`, `8px`, `12px`) governs badge pills, order attribute chips, and dense table specs.
- Macro-spacing (`24px`, `32px`, `48px`, `64px`) separates product sections, banner showcases, and proof upload sequences.
- Service grids use tight, confident gutters (`16px` to `24px`) to emulate compact sample swatches and physical print swatch books.

## Elevation & Depth

Visual hierarchy adopts a tactile layered model inspired by layered acrylics, embossed stamps, and metallic foil badges:

- **Base Layer (Canvas)**: Solid deep forest emerald (`#061812`).
- **Surface Level 1 (Panels & Feed)**: `#0B261D` with a subtle 1px inner stroke `rgba(255, 255, 255, 0.08)`.
- **Surface Level 2 (Interactive Cards & Spec Sheets)**: `#13382C` with a drop shadow: `0 4px 16px rgba(0, 0, 0, 0.45)`.
- **Surface Level 3 (Featured Badges & Tactile Plates)**: Emulates the physical copper and magenta badges using subtle gradient fills (`linear-gradient(180deg, #E0681B 0%, #B84D0D 100%)`) paired with an extruded bottom lip shadow: `0 4px 0 #7A3005, 0 8px 16px rgba(0, 0, 0, 0.5)`.
- **Primary CTA Elevation**: Magenta elements feature a neon-diffused glow: `0 0 20px rgba(230, 0, 103, 0.35), 0 4px 12px rgba(0, 0, 0, 0.4)`.

## Shapes

The design system employs a disciplined **Rounded** radius scale (`8px` base, `16px` container, `24px` modal), mirroring rounded corner-cut business cards, metal tags, and acrylic plaques:

- **Pills / Capsules (`9999px`)**: Reserved for service tag clouds ("Flex Print", "Visiting Card", "ID-Card"), contact chips, and status badges.
- **Medium Curves (`8px`)**: Applied to standard text inputs, buttons, spec table frames, and swatch tiles.
- **Large Curves (`16px`)**: Applied to service product cards, quotation summary containers, and interactive mockup viewers.
- **Thick Graphic Borders**: Selected hero elements feature an intentional 2px to 3px solid rim in brushed gold/copper (`#D49B4B` or `#E0681B`), reproducing the circular sign edge from the studio badge.

## Components

### Buttons
- **Primary CTA (Magenta Punch)**: Solid `#E60067` with `#FFFFFF` label (`Space Grotesk`, semibold, uppercase). Subtle 2px bottom lip shadow (`#A60049`) for tactile press response. Hover yields an active glow: `box-shadow: 0 0 16px rgba(230,0,103,0.5)`.
- **Secondary CTA (Copper Badge)**: Gradient `#E0681B` to `#C75410`, `#FFFFFF` label, subtle bevel border. Used for requesting instant quotes or WhatsApp inquiries.
- **Ghost / Outline**: 1.5px border `#FFDE00`, transparent fill, `#FFDE00` label for secondary specs and download links.

### Badges & Chips
- **Service Spec Chips**: Compact pills with dark emerald background (`#0B261D`), 1px gold border (`rgba(224, 104, 27, 0.4)`), and yellow text (`#FFDE00`) for materials like "350 GSM Matte", "Vinyl", or "UV Spot".
- **Contact Pill**: Pill-shaped deep container with WhatsApp green icon and bold yellow phone typography (`#FFDE00`).

### Cards & Service Tiles
- **Product Card**: Background `#13382C`, 16px border-radius, top accent line in `#E60067` or `#FFDE00`. Displays thumbnail preview of print product, finish badges, dimension tag, and starting price.
- **Deal / Service Roster Plate**: Styled after the horizontal banner plaque in the reference badge—rich amber/copper textured container (`#D46115`), crisp white typography with subtle drop-shadow for guaranteed outdoor readability.

### Input Fields & Selectors
- **Form Controls**: Rich `#082018` surface with a 1.5px `#1B4A3B` resting border.
- **Focus State**: 2px `#E60067` ring with `0 0 10px rgba(230,0,103,0.3)`. Text color `#FFFFFF`, placeholder `#709789`.

### Print Order Progress Tracker
- A 4-step horizontal node system: "Design Ready" -> "Proof Approved" -> "In Press" -> "Dispatched". Completed nodes glow with `#FFDE00`, active node in `#E60067` with a pulse animation.