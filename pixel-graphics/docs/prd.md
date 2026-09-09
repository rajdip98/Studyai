# Product Requirements Document (PRD)
## Pixel Graphics — Design & Print Solution

**Document status:** Draft v1.0  
**Product:** Pixel Graphics Studio website  
**Primary business:** Commercial design and print production  
**Primary location:** Dhaleshwar, Agartala, Tripura 799007

## 1. Product overview
Pixel Graphics is a conversion-focused studio website for a local commercial print business. The UI positions the studio as a fast, technically capable print-production partner while making it easy to request quotes, send artwork, review capabilities, and contact the production desk.

The experience combines a dark print-shop aesthetic with CMYK-inspired accents, tactile cards, production specifications, portfolio proof, and direct WhatsApp/email actions.

## 2. Goals
- Generate qualified quote and inquiry requests.
- Clearly communicate the breadth of print services.
- Build trust through technical specifications and production examples.
- Make WhatsApp and email the fastest paths to conversion.
- Showcase finished work and production quality.
- Support mobile users while preserving a dense, professional desktop experience.
- Establish a reusable visual system for future order/proof workflows.

## 3. Non-goals
- Full ecommerce checkout in the current marketing site.
- Online payment processing.
- Automated production scheduling.
- Automated price calculation for every service.
- Customer account management unless introduced in a future phase.

## 4. Target users
### Local business owners
Need signage, stationery, cards, marketing material, and quick turnaround.

### Event and institutional coordinators
Need banners, certificates, IDs, merchandise, awards, and event collateral.

### Corporate marketing teams
Need repeatable branded stationery, fleet graphics, apparel, promotional products, and bulk print.

### Creative/design professionals
Need production-ready output, material choices, proofs, and reliable print fidelity.

## 5. Primary user journeys
1. **Discover → service → inquiry**
   - Land on hero.
   - Scan service categories.
   - Open a relevant service.
   - Send WhatsApp inquiry or request a quote.

2. **Portfolio → proof → inquiry**
   - Review production portfolio.
   - Inspect material/specification details.
   - Contact studio with a similar requirement.

3. **Specification-led buyer**
   - Review DPI, GSM, substrate, finishing, and turnaround claims.
   - Compare relevant services.
   - Request a detailed quote.

4. **Direct-contact buyer**
   - Tap WhatsApp or email.
   - Share dimensions, quantity, and artwork.
   - Receive estimate/proof from the production desk.

## 6. Information architecture
- Home
  - Hero / value proposition
  - Services
  - Production specifications
  - Portfolio
  - Contact / inquiry
- Services
  - Flex & banners
  - Visiting cards & letterheads
  - ID/PVC cards
  - Envelopes, pamphlets & posters
  - Mementos, badges & tags
  - Bill books & book printing
  - Certificates & diaries
  - Vinyl & one-way vision
  - T-shirt & fabric printing
  - Mugs, pens & corporate gifts
- Portfolio
  - Banners & flex
  - Cards & stationery
  - Custom merchandise
  - Vinyl & fleet
- Contact
  - WhatsApp
  - Email
  - Location
  - Inquiry form

## 7. Functional requirements
### FR-01 Navigation
The site shall provide persistent navigation to Services, Our Works, Specs, and Contact.

### FR-02 Quote CTA
A prominent quote action shall open an email composition addressed to the studio.

### FR-03 WhatsApp CTA
A prominent WhatsApp action shall open a direct conversation with the studio number.

### FR-04 Service catalogue
Each service shall expose:
- service name
- short description
- key production specifications
- material/finish tags
- inquiry CTA

### FR-05 Portfolio
Portfolio cards shall communicate:
- project type
- application
- material/process
- dimensions or quantity where useful
- production/verification indicator

### FR-06 Inquiry form
The contact form shall collect:
- full name / organization
- phone / WhatsApp
- required service
- dimensions
- quantity
- notes
- optional artwork/proof workflow in a future release

### FR-07 Responsive UI
The experience shall adapt to mobile, tablet, and desktop layouts.

### FR-08 Accessibility
Interactive controls shall have visible focus states, semantic labels, readable contrast, and keyboard access.

## 8. Content requirements
The website should communicate:
- fast/same-day flex priority where operationally true
- high-resolution print capability
- production location
- service breadth
- material/finish expertise
- direct human contact
- proof-oriented workflow

Claims such as turnaround, DPI, or material availability must remain editable so operations can update them without redesigning the site.

## 9. Design requirements
- Deep forest-green visual base.
- Vivid process-magenta primary CTA.
- Electric yellow secondary accent.
- Copper/orange tactile accent.
- Outfit for display/headlines.
- Hanken Grotesk for body text.
- Space Grotesk for technical labels.
- Rounded cards and capsule tags.
- Layered surfaces and subtle glow/elevation.
- CMYK/print-registration motifs used as supporting decoration, not essential content.

## 10. Success metrics
- Quote CTA click-through rate.
- WhatsApp click-through rate.
- Inquiry-form completion rate.
- Service-card engagement.
- Portfolio engagement.
- Mobile conversion rate.
- Qualified inquiries per week.
- Inquiry-to-order conversion rate.

## 11. Acceptance criteria
The MVP is complete when:
- All primary services are represented.
- Contact routes work.
- Portfolio content renders correctly.
- Mobile and desktop layouts are usable.
- Key claims are editable.
- Forms have validation and success/error states.
- Accessibility checks pass for keyboard navigation and core contrast.
- Analytics can measure CTA and form conversions.

## 12. Future roadmap
### Phase 2
- File upload for artwork.
- Automated quote request tracking.
- Proof approval flow.
- Customer order status.

### Phase 3
- Pricing rules engine.
- Customer dashboard.
- Online payments.
- Repeat-order templates.
- Production status: Design Ready → Proof Approved → In Press → Dispatched.
