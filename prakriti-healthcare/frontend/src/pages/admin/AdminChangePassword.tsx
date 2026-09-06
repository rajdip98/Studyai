import { useState } from "react";
import { usersApi } from "../../api/users";
import { ApiError } from "../../api/client";

export default function AdminChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      const result = await usersApi.changePassword(currentPassword, newPassword);
      setMessage(result.message);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not change password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="font-serif text-2xl font-semibold">Change Admin Password</h1>
      <p className="mt-1 text-sm text-muted">
        This changes the password used to sign in at <code>/site/in/admin</code>. Changing it signs you out of
        every other active session.
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <input
          type="password"
          required
          placeholder="Current password"
          className="input-field"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />
        <input
          type="password"
          required
          minLength={10}
          placeholder="New password (min. 10 characters, upper + lower + number)"
          className="input-field"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />
        {error && <p className="text-sm text-sale">{error}</p>}
        {message && <p className="text-sm text-secondary">{message}</p>}
        <button className="btn-primary w-full" type="submit" disabled={submitting}>
          {submitting ? "Updating…" : "Update Password"}
        </button>
      </form>
    </div>
  );
}
