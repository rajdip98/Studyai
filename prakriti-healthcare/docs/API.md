# API Reference

Base URL: `/api`. All responses are JSON. Authenticated routes rely on
httpOnly cookies (`access_token`, `refresh_token`) — there is no
`Authorization: Bearer` header flow for the browser client. State-changing
requests (`POST`/`PATCH`/`PUT`/`DELETE`) require an `X-CSRF-Token` header
matching the `csrf_token` cookie (see SECURITY.md).

Errors follow a consistent shape:

```json
{ "error": { "code": "INVALID_CREDENTIALS", "message": "Invalid email or password" } }
```

## Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | – | Create an account. Sends an email verification link. |
| POST | `/login` | – | Body: `{ email, password, totpCode? }`. Returns `{ requires2fa: true }` if 2FA is enabled and no code was sent. |
| POST | `/refresh` | refresh cookie | Rotates the refresh token, issues a new access token. |
| POST | `/logout` | – | Revokes the current refresh token. |
| POST | `/logout-all` | session | Revokes every active session for the user. |
| POST | `/forgot-password` | – | Always returns 200 regardless of whether the email exists. |
| POST | `/reset-password` | – | Body: `{ token, password }`. Revokes all sessions on success. |
| POST | `/verify-email` | – | Body: `{ token }`. |
| POST | `/2fa/start` | session | Begins TOTP enrollment, returns a secret + `otpauth://` URL for a QR code. |
| POST | `/2fa/confirm` | session | Body: `{ totpCode }`. Enables 2FA. |
| POST | `/2fa/disable` | session | Disables 2FA. |
| GET | `/me` | session | `{ user: { id, role } }`. |

## Users — `/api/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/me` | session | Full profile. |
| PATCH | `/me` | session | Update display name. |
| POST | `/me/change-password` | session | Body: `{ currentPassword, newPassword }`. Revokes other sessions. |

## Catalog — `/api/products`, `/api/categories`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/products` | – | Query: `category`, `search`, `bestseller`, `page`, `limit`. |
| GET | `/products/:slug` | – | Single product with reviews. |
| POST | `/products` | admin | Create a product. |
| PATCH | `/products/:slug` | admin | Update a product. |
| DELETE | `/products/:slug` | admin | Soft-delete (sets `isActive: false`). |
| GET | `/categories` | – | List all categories. |

## Cart — `/api/cart` (session required)

| Method | Path | Description |
|---|---|---|
| GET | `/` | Current user's cart. |
| POST | `/items` | Body: `{ productId, quantity }`. |
| PATCH | `/items/:productId` | Body: `{ quantity }`. |
| DELETE | `/items/:productId` | Remove an item. |

## Addresses — `/api/addresses` (session required)

| Method | Path | Description |
|---|---|---|
| GET | `/` | List saved addresses. |
| POST | `/` | Create an address. |
| DELETE | `/:id` | Remove an address (ownership-checked). |

## Orders — `/api/orders` (session required)

| Method | Path | Header | Description |
|---|---|---|---|
| GET | `/` | | List the current user's orders. |
| GET | `/:id` | | Single order (ownership-checked). |
| POST | `/` | `X-Idempotency-Key` (required) | Creates an order from the current cart + a Razorpay order. |

## Payments — `/api/payments`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/verify` | session | Body: `{ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }`. Fast-path confirmation. |
| POST | `/webhook` | HMAC-signed by Razorpay | Authoritative payment status updates. Not browser-callable. |

## Reviews — `/api/reviews`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | session | Body: `{ productId, rating, title?, body }`. One review per user per product. |

## Site assets — `/api/site-assets` (public, read-only)

Powers the admin-managed content shown on the storefront (homepage banners,
posters, the payment QR code at checkout).

| Method | Path | Description |
|---|---|---|
| GET | `/` | Query: `type` (`HERO_BANNER`\|`PROMO_BANNER`\|`POSTER`\|`PAYMENT_QR`\|`LOGO`). Returns only `isActive: true` assets. |

## Admin — `/api/admin` (admin role required)

The admin panel (frontend route `/site/in/admin`) is built entirely on these
endpoints — see SECURITY.md for how the panel itself is protected.

| Method | Path | Description |
|---|---|---|
| GET | `/orders` | Paginated list of all orders. |
| PATCH | `/orders/:id/status` | Body: `{ status }`. Audit-logged. |
| GET | `/users` | Paginated user list. |
| GET | `/audit-logs` | Latest 200 audit log entries. |
| POST | `/uploads` | `multipart/form-data`, field `file`. Validates the file's real content (magic bytes) — not its filename or declared MIME type — and stores it (S3 if configured, else local disk). Returns `{ url, key }`. Rate-limited and audit-logged. |
| GET | `/site-assets` | Query: `type?`. All assets (including inactive), for the management UI. |
| POST | `/site-assets` | Body: `{ type, url, key, altText?, sortOrder? }`. `url`/`key` come from `/uploads`. |
| PATCH | `/site-assets/:id` | Body: `{ altText?, sortOrder?, isActive? }`. |
| DELETE | `/site-assets/:id` | Deletes the record and the underlying file. |
| GET | `/products` | Paginated list of **all** products, including inactive ones (the public `/api/products` only returns active products). Product create/update/delete still go through the existing admin-only endpoints on `/api/products` (see Catalog above) — a product's `images` array is populated by calling `/uploads` first, then attaching the returned URL. |

## Health & observability — `/health`

| Method | Path | Description |
|---|---|---|
| GET | `/live` | Liveness probe — always 200 if the process is running. |
| GET | `/ready` | Readiness probe — checks DB + Redis connectivity. |
| GET | `/metrics` | Prometheus exposition format. Restrict to internal network in production. |
