import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../api/auth";
import { ApiError } from "../api/client";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await authApi.register(name, email, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="container max-w-md py-20 text-center">
        <h1 className="font-serif text-2xl font-semibold">Check your email</h1>
        <p className="mt-3 text-muted">
          We've sent a verification link to <strong>{email}</strong>. Verify your email, then{" "}
          <Link to="/login" className="text-primary">
            sign in
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="container flex min-h-[60vh] max-w-md flex-col justify-center py-12">
      <h1 className="font-serif text-2xl font-semibold">Create your account</h1>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <input
          type="text"
          required
          placeholder="Full name"
          className="input-field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
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
          minLength={10}
          placeholder="Password (min. 10 characters)"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        {error && <p className="text-sm text-sale">{error}</p>}
        <button className="btn-primary w-full" type="submit" disabled={submitting}>
          {submitting ? "Creating account…" : "Create Account"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary">
          Sign in
        </Link>
      </p>
    </div>
  );
}
