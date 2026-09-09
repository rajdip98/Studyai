# Technical Requirements Document (TRD)
## Pixel Graphics — Design & Print Solution

**Document status:** Draft v1.0  
**Reference UI:** Uploaded Pixel Graphics HTML + DESIGN.md

## 1. Technical direction
The reference implementation is a responsive, single-page marketing interface using HTML, Tailwind-style utility classes, Material Symbols, and Google-hosted fonts. The production implementation should preserve the visual language while moving business-critical data and integrations into maintainable application components.

## 2. Recommended architecture
### Frontend
- Semantic HTML5.
- Tailwind CSS or an equivalent utility/component system.
- Component-based framework such as Next.js/React if the site is expected to grow.
- Responsive breakpoints for mobile, tablet, and desktop.
- Client-side form validation with server-side validation as the source of truth.

### Backend
A lightweight API/service layer should handle:
- inquiry submission
- email notification
- spam protection
- optional file upload
- analytics/event ingestion
- future quote/order records

### Storage
No customer data should be persisted unless required. If persistence is introduced:
- PostgreSQL or another managed relational database.
- Object storage for artwork/proofs.
- Separate metadata and binary-file storage.

## 3. Core routes/pages
- `/` — main marketing page.
- `/services` — service catalogue.
- `/portfolio` — production portfolio.
- `/contact` — inquiry and contact information.
- `/docs/prd` — product requirements.
- `/docs/trd` — technical requirements.
- `/docs/security` — security requirements.
- `/docs/agent` — AI/automation agent instructions.

For the requested documentation UI, PRD, TRD, Security, and Agent are separate pages and should share the same design shell.

## 4. Components
### Global
- Header
- Navigation
- Mobile navigation
- CTA buttons
- Footer
- Toast/alert
- Modal/lightbox
- Documentation sidebar

### Business
- ServiceCard
- SpecChip
- PortfolioCard
- ContactCard
- InquiryForm
- QuoteCTA
- ProductionStatus
- ProofViewer (future)
- FileUploader (future)

## 5. Data models
### Inquiry
```text
id
created_at
name
organization
phone
email
service
dimensions
quantity
notes
source
status
```

### PortfolioItem
```text
id
title
category
description
material
process
dimensions
quantity
image_url
published
```

### Service
```text
id
name
slug
description
materials[]
finishes[]
specifications[]
cta_label
active
```

## 6. API requirements
### POST /api/inquiries
Accept a validated inquiry payload.

Requirements:
- JSON request body.
- Content-Type validation.
- Server-side field validation.
- Rate limiting.
- Bot/spam detection.
- Structured error response.
- No sensitive data in logs.

Example response:
```json
{
  "success": true,
  "message": "Inquiry received"
}
```

### Future POST /api/uploads
- Signed upload URL.
- File type allowlist.
- File size limit.
- Malware scanning where supported.
- Short-lived access URLs.

## 7. External integrations
### WhatsApp
The public CTA may open a WhatsApp conversation. Do not expose private API credentials in frontend code.

### Email
The public inquiry route should submit to a server-side mail provider or transactional email service. Never embed SMTP/API credentials in browser JavaScript.

### Maps
Use a privacy-conscious map link or static location card where possible.

## 8. Performance
Targets:
- LCP ≤ 2.5s on a representative 4G mobile connection.
- CLS ≤ 0.1.
- INP ≤ 200ms where feasible.
- Compress portfolio images.
- Lazy-load below-the-fold images.
- Avoid unnecessary JavaScript for static sections.
- Self-host critical fonts if licensing/performance requirements justify it.

## 9. Accessibility
- WCAG 2.2 AA target.
- Semantic headings in correct order.
- Keyboard navigability.
- Focus-visible states.
- Form labels and errors.
- Alt text for meaningful images.
- Decorative images marked appropriately.
- Do not encode essential information solely by color.

## 10. SEO
- Unique title and description.
- Canonical URL.
- Open Graph metadata.
- Organization/local-business structured data where accurate.
- Descriptive service URLs.
- Sitemap and robots configuration.
- Noindex documentation pages if they are intended for internal use only.

## 11. Observability
Track:
- page views
- CTA clicks
- WhatsApp clicks
- mail clicks
- form starts
- form submissions
- validation failures
- upload failures
- API errors

Logs must exclude message bodies, passwords, tokens, uploaded file contents, and unnecessary personal information.

## 12. Deployment
Recommended:
- Git-based source control.
- Preview deployments for pull requests.
- Production deployment behind HTTPS.
- Environment variables for all secrets.
- Automated build/test/lint checks.
- Backups for any persistent database.

## 13. Testing
### Unit
- form validation
- service data rendering
- CTA generation

### Integration
- inquiry API
- email delivery
- spam/rate-limit controls

### E2E
- navigation
- mobile menu
- service inquiry
- contact form success/error
- external CTA behavior

### Visual
- desktop 1440px
- tablet 1024px
- mobile 390px
- dark theme consistency
- no horizontal overflow

## 14. Technical acceptance criteria
- No secrets in client bundles.
- Core pages work without JavaScript where practical.
- API rejects malformed requests.
- Rate limits are enforced.
- Production assets are optimized.
- All external links use HTTPS.
- Error states are user-friendly and non-sensitive.
