# Pixel Graphics — self-hosted backend

A small, dependency-light Express server that adds:

- A password-gated **admin panel** (`/admin.html`) for the studio owner.
- **File uploads** (images, posters, banners, product photos, PDF/AI/PSD/EPS/SVG/ZIP design files) that appear on the live "Our Works" section of the public site.
- **In-panel password change.**

No third-party backend service is used — everything is plain Node.js, storing data as local JSON files and uploaded files on disk under this folder.

## Run it

```bash
cd server
npm install
npm start
```

Then open:

- Public site: `http://localhost:3000/`
- Admin panel: `http://localhost:3000/admin.html`

**Default admin password:** `subroto@100` — log in and use the "Change Password" form in the admin panel to set your own as soon as possible. The password is never stored in plain text (it's hashed with bcrypt in `server/data/admin.json`).

## What's stored where

- `server/data/admin.json` — the admin password hash. Never commit a real production password hash you care about keeping private to a public repo; treat this file like a secret once you've changed the password.
- `server/data/portfolio.json` — metadata (title, category, description, file info) for every uploaded work.
- `server/public/uploads/` — the actual uploaded files, served at `/uploads/<file>`.
- `server/data/.session-secret` — auto-generated on first run; signs admin login sessions. Do not commit it (it's git-ignored). Deleting it invalidates all active admin sessions.

## Deploying for real

- Put this behind HTTPS (a reverse proxy like Caddy/Nginx, or a platform that terminates TLS for you) — session cookies are marked `secure` automatically once the request is seen as HTTPS.
- Optionally set a `SESSION_SECRET` environment variable yourself instead of relying on the auto-generated file (useful if you run multiple instances behind a load balancer).
- Optionally set `PORT` to change the listening port (defaults to `3000`).
- Back up `server/data/` and `server/public/uploads/` periodically — that's the entire "database" for this app.
