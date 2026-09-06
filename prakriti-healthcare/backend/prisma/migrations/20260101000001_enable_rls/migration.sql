-- Enables Row Level Security (default-deny: no policies) on every table.
--
-- Why this is needed even though the app never queries Postgres through
-- Supabase's PostgREST/Realtime layer: those layers connect as the `anon`
-- and `authenticated` Postgres roles, and Supabase's public ("publishable")
-- anon key lets *anyone* call that API directly. Without RLS, every table is
-- fully readable and writable through it, completely bypassing this app's
-- own authentication, RBAC, and audit logging.
--
-- This is safe for our architecture specifically: the backend (Prisma)
-- connects with a privileged direct Postgres connection, which is
-- unaffected by RLS. Enabling RLS with zero policies only closes the
-- anon/authenticated-role hole; it does not change how the backend itself
-- reads or writes data.
--
-- If this project later adds real Supabase Auth-based client-side access
-- (not currently the case — auth is fully custom, see backend/src/modules/auth),
-- add explicit policies here rather than disabling RLS.

ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."RefreshToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EmailToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Address" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Cart" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CartItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SiteAsset" ENABLE ROW LEVEL SECURITY;
