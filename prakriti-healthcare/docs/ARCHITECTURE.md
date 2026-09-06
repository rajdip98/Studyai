# Architecture

## System overview

```
                        ┌────────────────────┐
                        │        CDN         │  (static assets, product images)
                        └─────────┬──────────┘
                                  │
   Browser ───HTTPS───▶  ┌────────▼─────────┐
                         │  Frontend (SPA)   │  React + Vite, served as static
                         │  nginx container  │  files behind a CDN/load balancer
                         └────────┬──────────┘
                                  │ /api/* (HTTPS, same-site cookies)
                         ┌────────▼──────────┐
                         │   Load balancer   │  TLS termination, WAF (cloud-provided)
                         └────────┬──────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │     Backend API (N pods)   │  Node.js + Express, stateless
                    └───┬─────────────┬──────────┘
                        │             │
                ┌───────▼──────┐ ┌────▼─────┐        ┌──────────────┐
                │  PostgreSQL  │ │  Redis   │        │  Razorpay    │
                │  (primary +  │ │ (rate    │◀──────▶│  (payments,  │
                │   replica)   │ │  limits, │  webhook│  webhooks)  │
                └──────────────┘ │  tokens) │        └──────────────┘
                                  └──────────┘
```

The backend is stateless (all session state lives in Postgres/Redis, not in
process memory), so it can be scaled horizontally behind a load balancer
without sticky sessions.

## Data model

See `backend/prisma/schema.prisma` for the authoritative schema. Key
entities:

- **User** — credentials, role (CUSTOMER/ADMIN/SUPPORT), lockout state, TOTP secret.
- **RefreshToken** — hashed, rotated on every use, grouped into rotation
  "families" for theft detection (see SECURITY.md).
- **Product / Category** — catalog. Prices are stored as integer paise, never
  floats, to avoid rounding-error bugs in money math.
- **Cart / CartItem** — one active cart per user.
- **Order / OrderItem** — an immutable snapshot of cart contents and prices at
  checkout time; later price changes to a Product never retroactively affect
  a placed order.
- **Payment** — one per order; tracks the payment gateway's order/payment IDs
  and whether its signature was cryptographically verified.
- **AuditLog** — append-only trail of security-relevant actions (logins,
  password changes, admin actions, order status changes).

## Request flow: checkout

1. Client adds items to `/api/cart` (server-side cart, keyed by session user).
2. Client calls `POST /api/orders` with an address and an `X-Idempotency-Key`
   header. The server:
   - recomputes the order total from live `Product` rows (never trusts
     client-submitted prices),
   - reserves stock inside a DB transaction,
   - creates the `Order`/`OrderItem` rows and a `Payment` row,
   - creates a Razorpay order server-side.
3. Client runs the Razorpay Checkout widget with the returned `gatewayOrderId`.
4. On success, the client calls `POST /api/payments/verify` (fast-path UX
   confirmation) — the server independently verifies the HMAC signature Razorpay
   returned before trusting it.
5. Razorpay's server-to-server webhook (`POST /api/payments/webhook`) is the
   *authoritative* source of truth: it's independently signature-verified over
   the raw request body and updates the order to `PAID`/`FAILED` even if the
   client never returns from checkout (e.g. tab closed, network drop).

## Why these choices

- **Prisma over raw SQL** — every query is parameterized by construction,
  removing SQL injection as an attack surface for typical CRUD paths.
- **httpOnly cookies over localStorage for tokens** — the #1 practical defense
  against token theft via XSS, since injected JS cannot read httpOnly cookies.
- **Opaque, rotated refresh tokens** — a stolen refresh token can only be used
  once before rotation invalidates it; reuse triggers full family revocation.
- **Idempotency keys on order creation** — protects against double-charging
  from double-clicks, client retries, or network replays.
- **Money stored as integer paise** — floating point currency math is a
  classic, avoidable source of off-by-a-paise bugs and rounding exploits.
