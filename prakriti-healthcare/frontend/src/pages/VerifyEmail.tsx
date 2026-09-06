import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { authApi } from "../api/auth";
import { ApiError } from "../api/client";

// Reached via the link emailed after registration
// (e.g. /verify-email?token=...). Without this page, verification was a
// dead end — nothing consumed the emailed token.
export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"verifying" | "done" | "error">("verifying");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("This link is missing its verification token.");
      return;
    }
    authApi
      .verifyEmail(token)
      .then(() => setStatus("done"))
      .catch((err) => {
        setStatus("error");
        setError(err instanceof ApiError ? err.message : "Could not verify this email link.");
      });
  }, [token]);

  return (
    <div className="container max-w-md py-20 text-center">
      {status === "verifying" && <p className="text-muted">Verifying your email…</p>}
      {status === "done" && (
        <>
          <h1 className="font-serif text-2xl font-semibold text-primary">Email verified</h1>
          <p className="mt-3 text-muted">
            Your account is now verified.{" "}
            <Link to="/login" className="text-primary">
              Sign in
            </Link>
          </p>
        </>
      )}
      {status === "error" && (
        <>
          <h1 className="font-serif text-2xl font-semibold">Verification failed</h1>
          <p className="mt-3 text-muted">{error}</p>
        </>
      )}
    </div>
  );
}
