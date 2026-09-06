# Prakriti Healthcare

A full-stack e-commerce platform for Prakriti Healthcare's Ayurvedic supplement
line, built from the "Botanical Veda" Stitch design. Lives alongside the
existing `studyai.html` project in this repository as an independent app.

```
prakriti-healthcare/
├── backend/    Node.js + Express + TypeScript API (Postgres via Prisma, Redis)
├── frontend/   React + Vite + TypeScript storefront (Tailwind CSS)
├── docs/       Architecture, security, API and deployment documentation
├── docker-compose.yml       Local dev stack (Postgres, Redis, backend, frontend)
├── docker-compose.prod.yml  Production-shaped reference compose file
└── .gitignore
```

## Quick start (local development)

**Prerequisites:** Node.js 20+, Docker (for Postgres/Redis), npm.

```bash
# 1. Start Postgres + Redis
cd prakriti-healthcare
docker compose up -d postgres redis

# 2. Backend
cd backend
cp .env.example .env        # edit secrets as needed
npm install
npx prisma migrate dev
npm run prisma:seed         # creates sample products + an admin user
npm run dev                 # http://localhost:4000

# 3. Frontend (separate terminal)
cd ../frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

Or run everything with one command: `docker compose up --build` from
`prakriti-healthcare/`.

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system design, data model, request flow
- [`docs/SECURITY.md`](docs/SECURITY.md) — the full security model and hardening checklist
- [`docs/API.md`](docs/API.md) — REST API reference
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — hosting, CI/CD, caching/CDN, monitoring, rate limiting

## Tech stack

| Layer      | Choice |
|------------|--------|
| Frontend   | React 18, Vite, TypeScript, Tailwind CSS, React Router |
| Backend    | Node.js 20, Express, TypeScript |
| Database   | PostgreSQL (via Prisma ORM) |
| Cache/Queue| Redis (rate limiting, token/session bookkeeping) |
| Auth       | httpOnly JWT access + rotating opaque refresh tokens, Argon2id, optional TOTP 2FA |
| Payments   | Razorpay (server-verified HMAC signatures + webhooks) |
| Testing    | Jest/Supertest (backend), Vitest/RTL + Playwright (frontend) |
| CI/CD      | GitHub Actions (`.github/workflows/prakriti-ci.yml`, `prakriti-cd.yml`) |
