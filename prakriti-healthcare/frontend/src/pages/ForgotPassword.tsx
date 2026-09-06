import { useState } from "react";
import { authApi } from "../api/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email);
    } finally {
      // Always show the same confirmation, whether or not the email exists,
      // to avoid leaking which addresses are registered.
      setSent(true);
      setSubmitting(false);
    }
  }

  return (
    <div className="container flex min-h-[60vh] max-w-md flex-col justify-center py-12">
      <h1 className="font-serif text-2xl font-semibold">Reset your password</h1>
      {sent ? (
        <p className="mt-4 text-muted">If that email is registered, a reset link has been sent.</p>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <input
            type="email"
            required
            placeholder="Email address"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn-primary w-full" type="submit" disabled={submitting}>
            {submitting ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
    </div>
  );
}
