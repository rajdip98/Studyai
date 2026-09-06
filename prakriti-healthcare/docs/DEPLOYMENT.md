# Deployment, Infrastructure & Operations

This environment has no cloud accounts connected, so nothing here has been
deployed live. Everything below is production-ready configuration and a
concrete runbook — follow it against whichever accounts you provision.

## Hosting & cloud

The app is two independently deployable containers (`backend/Dockerfile`,
`frontend/Dockerfile`) plus a database and Redis. **Database and file
storage are Supabase** (see Database & storage below) regardless of which
option you pick for the backend/frontend containers themselves:

**Simplest — PaaS (recommended to start):**
- **Backend**: [Render](https://render.com) / [Railway](https://railway.app) /
  Fly.io — point at `backend/Dockerfile`, attach a managed Postgres + Redis
  add-on, set the env vars from `backend/.env.example` as secrets.
- **Frontend**: deploy the static `frontend/dist` build to
  [Vercel](https://vercel.com) / [Netlify](https://netlify.com) / Cloudflare
  Pages, or serve `frontend/Dockerfile` behind the same PaaS. These platforms
  give you a CDN, TLS, and preview deployments for free.

**More control — AWS:**
- Backend → **ECS Fargate** (or App Runner for less setup) running the
  backend image, behind an **Application Load Balancer** with a WAF (AWS
  WAFv2 — enable the managed "Core rule set" + "Known bad inputs" rule
  groups) and ACM-issued TLS certificate.
- Database/storage → **Supabase** (as above) rather than RDS/S3, unless you
  specifically need them in your own AWS account. Redis → **ElastiCache**.
- Frontend → build artifacts to **S3**, served via **CloudFront** (this is
  also your CDN — see below).
- Secrets → **AWS Secrets Manager**, injected into ECS task definitions as
  environment variables (never baked into the image).

Either way, `docker-compose.prod.yml` documents the exact environment
variables and service topology so translating to your orchestrator of choice
is mostly copy-and-adapt.

## CI/CD & version control

- **`.github/workflows/prakriti-ci.yml`** — runs on every PR touching
  `prakriti-healthcare/**`: lint, typecheck, unit + integration tests (against
  real Postgres/Redis service containers), `npm audit`, Docker image builds,
  and a Trivy vulnerability scan of both images.
- **`.github/workflows/prakriti-cd.yml`** — on merge to `main`, builds and
  pushes versioned images to GitHub Container Registry
  (`ghcr.io/<repo>/prakriti-backend`, `prakriti-frontend`), tagged by commit
  SHA and `latest`. The final `deploy` job is an intentional placeholder — it
  requires manual approval (GitHub Environments) and should be wired to call
  your platform's deploy API (e.g. `render-deploy-action`, `flyctl deploy`, or
  `aws ecs update-service`) once hosting is provisioned.
- **Branch protection** (configure in GitHub repo settings, not in code):
  require the CI workflow to pass and require at least one review before
  merging to `main`.

## Database & storage

This project uses **Supabase** for both:

- **Postgres**: a dedicated Supabase project provides the database. Schema
  changes are still authored and applied via Prisma
  (`backend/prisma/schema.prisma`, `prisma migrate deploy` in CI/CD before
  each release) — Supabase is just the hosted Postgres underneath; nothing
  about the migration workflow changes. Get the connection string from
  **Project Settings → Database → Connection string** and set it as
  `DATABASE_URL`. Supabase takes automated daily backups on paid plans; on
  the free tier, schedule your own (`pg_dump` on a cron) and test the
  restore procedure — a backup you've never restored from is not a backup.
- **Row Level Security**: the backend connects with a privileged direct
  Postgres connection, which bypasses RLS — but Supabase's own client
  libraries/REST API connect as the `anon`/`authenticated` roles, which
  **are** subject to RLS. This project enables RLS with no policies on every
  table (see `backend/prisma/migrations/20260101000001_enable_rls`), which
  is correct as long as nothing client-side ever talks to Supabase directly
  (true here — the frontend only calls this app's own `/api/*`, never
  Supabase's REST/GraphQL API). If you later add real Supabase Auth or
  client-side Supabase queries, you'll need actual RLS policies instead.
- **Object storage**: product images, banners, posters, and the payment QR
  code (all admin-uploaded via `/site/in/admin` → `POST /api/admin/uploads`)
  go to a Supabase Storage bucket named `site-assets` (public, 5MB limit,
  restricted to png/jpeg/webp — see `backend/src/utils/storage.ts`). Set
  `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API —
  the *secret* `service_role` key, never the anon/publishable one, and never
  expose it to the frontend) to enable it; without them, uploads silently
  fall back to local disk, which is fine for local development but must not
  be relied on in production (containers are ephemeral, and it doesn't scale
  past one replica).
- **Redis**: still self-hosted/managed separately (Supabase doesn't provide
  it) — used only for rate-limit counters and Prometheus scrape state, so
  it's safe to run without persistence (`--save ""`) and simply lose state
  on restart.

## Caching & CDN

- **Static assets** (`frontend/dist/assets/*`, content-hashed by Vite) are
  served with `Cache-Control: public, immutable, max-age=31536000` (see
  `frontend/nginx.conf`) — safe because the filename changes on every build.
- **`index.html`** is served `no-cache` so deploys are picked up immediately
  without needing cache invalidation.
- Put a CDN (CloudFront, Cloudflare, Fastly) in front of the frontend origin.
  Product images should be served through the same CDN
  (`CDN_BASE_URL` in `backend/.env.example` — already allow-listed in the
  API's CSP `img-src` directive in `middleware/security.ts`).
- The API itself is not cached at the CDN layer (it's per-user, cookie-gated
  data) — only `GET /api/products` and `/api/categories` are safe
  cache-control candidates if you later add a short (`max-age=60`) public
  cache header for anonymous catalog browsing at scale.

## Rate limiting

Already implemented and Redis-backed (see `backend/src/middleware/rateLimit.ts`
and SECURITY.md for the per-route table). In production, add a second layer
in front of the app for cheap DDoS absorption:
- Cloudflare's "I'm Under Attack" mode or WAF rate-limiting rules, or
- AWS WAF rate-based rules on the ALB,

so volumetric attacks are dropped before they even reach the Node process.

## Error tracking & logs

- **Sentry** — set `SENTRY_DSN` in the backend env
  (`backend/src/instrument.ts`) to get exception tracking with PII/secret
  scrubbing already wired in. Add `@sentry/react` to the frontend the same
  way if you want client-side error capture too.
- **Structured logs** — Pino (`backend/src/config/logger.ts`) emits JSON in
  production with authorization headers, cookies, and password/token fields
  redacted. Ship container stdout to your platform's log sink (CloudWatch
  Logs, Grafana Loki, Datadog) — do not write logs to local files inside the
  container.
- Every response carries an `X-Request-Id` header
  (`middleware/requestId.ts`) — ask users/support tickets for it to
  instantly find the matching log lines and Sentry event.

## Monitoring & alerts

- `GET /health/live` — liveness probe for your orchestrator's restart policy.
- `GET /health/ready` — readiness probe; checks live DB + Redis connectivity
  before routing traffic to a new instance.
- `GET /health/metrics` — Prometheus exposition format (request duration
  histogram, default Node.js process metrics). Scrape it with a Prometheus
  server or your platform's managed equivalent (Grafana Cloud, Datadog
  OpenMetrics integration) and **do not expose it to the public internet** —
  restrict via network policy/security group to your monitoring stack only.
- Suggested alert rules once metrics are flowing:
  - `/health/ready` failing for >2 consecutive checks → page on-call.
  - p95 `prakriti_http_request_duration_seconds` > 2s for 5 min → warn.
  - 5xx rate > 1% of requests over 5 min → warn; > 5% → page.
  - Postgres connection pool exhaustion / disk usage > 80% → warn.

## Testing strategy

| Layer | Tool | What it covers | Run |
|---|---|---|---|
| Backend unit | Jest | Password hashing, token generation/verification (no DB needed) | `npm test` in `backend/` |
| Backend integration | Jest + Supertest | Full HTTP auth flow against real Postgres/Redis | `INTEGRATION=1 npm test` (CI runs this automatically with service containers) |
| Frontend unit | Vitest + React Testing Library | Component rendering, formatting utilities | `npm test` in `frontend/` |
| End-to-end | Playwright | Golden-path smoke test (browse → product → checkout gate) | `npm run e2e` in `frontend/` |
| Static analysis | ESLint + TypeScript | Lint + type safety, both packages | `npm run lint && npm run typecheck` |
| Dependency/image security | `npm audit`, Trivy | Known-CVE scanning | CI only (`prakriti-ci.yml`) |

Extend the Playwright suite with a full checkout run once you have a staging
environment with Razorpay test-mode credentials and a seeded database — the
current e2e test intentionally stops at the login gate since it needs no
backend to be meaningful in plain CI.

## Release checklist

1. CI green on the PR (lint, typecheck, tests, audit, image scan).
2. `prisma migrate deploy` runs automatically before the new backend version
   receives traffic (add this as a release-phase/pre-deploy hook on your
   platform, or as an explicit CD step — do not run destructive migrations
   by hand against production).
3. Deploy backend first, then frontend (the API is backward-compatible
   within a release; the frontend is not guaranteed to be forward-compatible
   with an older API).
4. Watch `/health/ready`, error rate, and Sentry for 15 minutes post-deploy
   before considering the release stable.
