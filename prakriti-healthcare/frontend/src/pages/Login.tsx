import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname: string } } };
  const [email, setEmail] = useState("");
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
      const result = await login(email, password, needs2fa ? totpCode : undefined);
      if (result.requires2fa) {
        setNeeds2fa(true);
        return;
      }
      navigate(location.state?.from?.pathname ?? "/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container flex min-h-[60vh] max-w-md flex-col justify-center py-12">
      <h1 className="font-serif text-2xl font-semibold">Welcome back</h1>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <input
          type="email"
          required
          placeholder="Email address"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          type="password"
          required
          placeholder="Password"
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
      <p className="mt-4 text-center text-sm text-muted">
        No account? <Link to="/register" className="font-medium text-primary">Create one</Link>
      </p>
      <p className="mt-2 text-center text-sm">
        <Link to="/forgot-password" className="text-muted hover:text-primary">
          Forgot password?
        </Link>
      </p>
    </div>
  );
}
