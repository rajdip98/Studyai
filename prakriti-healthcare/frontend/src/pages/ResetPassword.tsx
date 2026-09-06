import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../api/auth";
import { ApiError } from "../api/client";

// Reached via the link emailed by POST /api/auth/forgot-password
// (e.g. /reset-password?token=...). Without this page, requesting a
// password reset was a dead end — nothing consumed the emailed token.
export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reset password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="container max-w-md py-20 text-center">
        <h1 className="font-serif text-2xl font-semibold">Invalid reset link</h1>
        <p className="mt-3 text-muted">
          This link is missing its reset token. Request a new one from the{" "}
          <Link to="/forgot-password" className="text-primary">
            forgot password
          </Link>{" "}
          page.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="container max-w-md py-20 text-center">
        <h1 className="font-serif text-2xl font-semibold">Password updated</h1>
        <p className="mt-3 text-muted">
          Your password has been changed. Please sign in again.{" "}
          <Link to="/login" className="text-primary">
            Go to login
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="container flex min-h-[60vh] max-w-md flex-col justify-center py-12">
      <h1 className="font-serif text-2xl font-semibold">Set a new password</h1>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <input
          type="password"
          required
          minLength={10}
          placeholder="New password (min. 10 characters)"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        {error && <p className="text-sm text-sale">{error}</p>}
        <button className="btn-primary w-full" type="submit" disabled={submitting}>
          {submitting ? "Updating…" : "Update Password"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        <button type="button" className="hover:text-primary" onClick={() => navigate("/login")}>
          Back to login
        </button>
      </p>
    </div>
  );
}
