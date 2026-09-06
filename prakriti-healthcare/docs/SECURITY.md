# Security Model

This document is the security reference for Prakriti Healthcare. It maps
concrete controls in the codebase to the threats they defend against, so a
reviewer (or a future contributor) can see *why* each piece exists, not just
that it does. No system is "unhackable" — the goal here is to close the
common, high-impact attack paths and make the rest expensive and observable.

## Authentication & session security

| Control | File | Threat mitigated |
|---|---|---|
| Argon2id password hashing (memory-hard) | `backend/src/utils/password.ts` | GPU/ASIC-accelerated offline cracking of a leaked hash DB |
| NIST-aligned password policy (length + character classes + common-password denylist) | `backend/src/utils/password.ts` | Weak/guessable passwords |
| Access tokens as short-lived (15 min) signed JWTs in **httpOnly** cookies | `backend/src/utils/tokens.ts`, `response.ts` | XSS cannot read the token to exfiltrate it; a leaked token expires fast |
| Refresh tokens as opaque random strings, hashed at rest, **rotated on every use** | `auth.service.ts` | A DB leak alone can't mint sessions (only hashes are stored); a captured token is single-use |
| Refresh-token reuse detection (rotation "families") | `auth.service.ts::rotateRefreshToken` | If a stolen (already-rotated) token is replayed, the entire session family is revoked — theft is contained, not just ignored |
| Double-submit-cookie CSRF tokens on all state-changing routes | `middleware/csrf.ts` | Cross-site request forgery — a malicious site can't forge a header it can't read |
| Account lockout after repeated failed logins (15 min) | `auth.service.ts` | Online brute-force / credential stuffing |
| Constant-shape responses on login failure (same error whether the email exists or not; dummy hash comparison on unknown email) | `auth.service.ts::loginUser` | Account enumeration via timing or message differences |
| Optional TOTP-based 2FA (otplib) | `auth.service.ts`, `/api/auth/2fa/*` | Credential-only compromise (phishing, password reuse) |
| Password change / reset revokes all other sessions | `users.routes.ts`, `auth.service.ts::resetPassword` | Attacker with a stolen session gets kicked out the moment the real user regains control |
| RBAC (`CUSTOMER` / `ADMIN` / `SUPPORT`) enforced via middleware, not client trust | `middleware/auth.ts::requireRole` | Privilege escalation |

## Injection & input handling

- **SQL injection**: all queries go through Prisma's parameterized query
  builder. Raw SQL (`$queryRawUnsafe`) is never used; `$queryRaw` (tagged
  template, safe) is used only for the health check.
- **Mass assignment**: every request body is validated (and *narrowed*) with
  Zod schemas (`middleware/validate.ts`) before touching the database —
  unknown/extra fields never reach a Prisma `data:` object un-vetted.
- **XSS**: React escapes all rendered text by default (no `dangerouslySetInnerHTML`
  anywhere in the app). User-generated free text (review bodies/titles) is
  additionally sanitized server-side with `sanitize-html` before storage.
- **HTTP Parameter Pollution**: `hpp()` middleware collapses duplicate query
  params to a single value.
- **IDOR (Insecure Direct Object Reference)**: every user-scoped lookup
  (`orders`, `addresses`, `cart`) filters by `userId` in the `WHERE` clause,
  not just by the record's own ID — a user cannot fetch or mutate another
  user's data by guessing IDs.

## Transport & headers

Applied via `helmet()` in `middleware/security.ts`:

- **HSTS** (production only) — forces HTTPS for a year, including subdomains.
- **Content-Security-Policy** — default-deny; only same-origin scripts/styles,
  no inline scripts, `object-src 'none'`, `frame-ancestors 'none'` (defends
  against clickjacking and most XSS payload execution even if one slips through).
- **X-Content-Type-Options: nosniff**, **Referrer-Policy: strict-origin-when-cross-origin**.
- Strict CORS allowlist (`corsOrigins` from env) — no wildcard origins in
  production; credentialed requests only from known frontend origins.

## Rate limiting & abuse prevention

Redis-backed (`middleware/rateLimit.ts`) so limits hold across multiple
backend replicas, not just a single process:

| Route class | Limit | Why |
|---|---|---|
| General API | 120 req/min/IP | Backstop against scraping/DoS-by-volume |
| Login/registration | 10 req/15min/IP | Credential stuffing, brute force |
| Password reset / email verification | 5 req/hour/IP | Email-bombing, token-guessing |
| Order/payment creation | 10 req/min/IP | Payment-intent flooding, inventory-lock abuse |

Request bodies are capped at 100kb (`express.json({ limit: "100kb" })`) to
blunt payload-based memory exhaustion.

## Payments

- The client **never** sets the charge amount — it's computed server-side
  from the live `Product` table at order-creation time.
- The Razorpay checkout signature is verified with `crypto.timingSafeEqual`
  over an HMAC-SHA256 the client cannot forge without the secret key.
- The webhook handler verifies its signature over the **raw, unparsed**
  request body (a common webhook-security bug is verifying a re-serialized
  JSON body, which silently breaks on whitespace/key-order differences).
- Webhook events are deduplicated by payload hash — replays are no-ops.
- No card data ever touches this codebase — PCI scope stays entirely with
  the gateway (Razorpay Checkout is a client-side hosted widget).

## Secrets & configuration

- All configuration is validated at boot via a Zod schema (`config/env.ts`)
  — the process refuses to start with missing/malformed secrets rather than
  silently running insecurely.
- `.env` files are gitignored; `.env.example` documents required variables
  with no real values.
- Logs redact `password`, `token`, `authorization`, `cookie`, and `totpSecret`
  fields (`config/logger.ts`) so secrets never leak into log aggregators or
  Sentry (`instrument.ts` additionally strips cookies/auth headers from error
  reports).
- **Production secret storage**: use your host's secret manager (AWS Secrets
  Manager / GCP Secret Manager / Doppler / 1Password Connect) to inject env
  vars at deploy time — never bake secrets into container images or commit
  them to the repo.

## Supply chain

- `npm audit --audit-level=high` runs in CI for both frontend and backend.
- Container images are scanned with Trivy in CI (`prakriti-ci.yml`).
- Dependencies pin to specific major/minor ranges in `package.json`; consider
  enabling Dependabot or Renovate for automated patch PRs (add
  `.github/dependabot.yml` scoped to `prakriti-healthcare/backend` and
  `prakriti-healthcare/frontend`).
- Multi-stage Docker builds run the final container as a **non-root user**
  with only production dependencies installed.

## Auditability

Every security-relevant action (login, password change, 2FA toggle, order
status change by an admin) is written to the append-only `AuditLog` table
(`utils/audit.ts`) with actor, IP, user agent, and a timestamp — this is your
first stop when investigating a suspected incident.

## OWASP Top 10 (2021) mapping

| Category | Where addressed |
|---|---|
| A01 Broken Access Control | RBAC middleware, per-user IDOR filtering, CSRF |
| A02 Cryptographic Failures | Argon2id, HTTPS/HSTS, hashed refresh tokens, timing-safe comparisons |
| A03 Injection | Prisma parameterization, Zod validation, sanitize-html |
| A04 Insecure Design | Idempotent checkout, server-computed pricing, rotation+reuse detection |
| A05 Security Misconfiguration | Zod-validated env, Helmet defaults, non-root containers |
| A06 Vulnerable Components | CI `npm audit` + Trivy image scanning |
| A07 Auth Failures | Lockout, MFA, generic error messages, session revocation on password change |
| A08 Software/Data Integrity | Webhook HMAC verification, signed JWTs |
| A09 Logging/Monitoring Failures | Structured logs, audit trail, Sentry, Prometheus metrics (see DEPLOYMENT.md) |
| A10 SSRF | No user-controlled outbound URL fetching exists in this codebase |

## What's intentionally out of scope for this codebase

These are organizational/infra controls that don't live in application code
— call them out explicitly rather than pretending they're covered:

- A managed WAF / DDoS protection (Cloudflare, AWS Shield) in front of the
  load balancer — see DEPLOYMENT.md.
- Periodic third-party penetration testing.
- A formal incident response runbook and on-call rotation.
- PCI-DSS compliance paperwork (mitigated by never touching card data, but
  compliance is a process, not just code).
