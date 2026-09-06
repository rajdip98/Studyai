import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../api/client";

// The admin panel is reached at /site/in/admin and asks only for a
// password — but under the hood it signs in through the exact same
// email+password login the rest of the app uses (see AuthContext), so it
// inherits real protection: Argon2id hashing, rate limiting, account
// lockout after repeated failures, rotating session cookies, optional 2FA,
// and an audit log entry per attempt. The email is fixed to the seeded
// admin account (VITE_ADMIN_EMAIL) rather than a secret — the password is
// what actually gates access, and it's changeable from "Change Password"
// once signed in.
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL ?? "admin@prakritihealthcare.com";

export default function AdminLogin() {
  const { login } = useAuth();
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [needs2fa, setNeeds2fa] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await login(ADMIN_EMAIL, password, needs2fa ? totpCode : undefined);
      if (result.requires2fa) {
        setNeeds2fa(true);
        return;
      }
      // A successful login that isn't actually an admin account still lands
      // here (AdminApp checks the role) rather than silently granting access.
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal px-4">
      <div className="w-full max-w-sm rounded-base bg-surface-pure p-8 shadow-level3">
        <h1 className="font-serif text-xl font-semibold text-primary">Prakriti Healthcare</h1>
        <p className="mt-1 text-sm text-muted">Admin Panel</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <input
            type="password"
            required
            autoFocus
            placeholder="Admin password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {needs2fa && (
            <input
              type="text"
              required
              inputMode="numeric"
              placeholder="6-digit authenticator code"
              className="input-field"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
            />
          )}
          {error && <p className="text-sm text-sale">{error}</p>}
          <button className="btn-primary w-full" type="submit" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
