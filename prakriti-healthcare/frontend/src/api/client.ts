const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  idempotencyKey?: string;
}

/**
 * Thin fetch wrapper. Always sends credentials (httpOnly auth cookies) and
 * attaches the CSRF token header (read from the non-httpOnly csrf_token
 * cookie set by the backend) on every state-changing request, matching the
 * double-submit-cookie scheme in backend/src/middleware/csrf.ts.
 */
export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const method = opts.method ?? "GET";
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (method !== "GET") {
    const csrfToken = getCookie("csrf_token");
    if (csrfToken) headers["X-CSRF-Token"] = csrfToken;
  }
  if (opts.idempotencyKey) headers["X-Idempotency-Key"] = opts.idempotencyKey;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: "include",
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json") ? await res.json() : undefined;

  if (!res.ok) {
    const err = data?.error ?? { code: "UNKNOWN_ERROR", message: "Something went wrong" };
    throw new ApiError(res.status, err.code, err.message);
  }

  return data as T;
}

export const api = {
  get: <T,>(path: string) => apiRequest<T>(path),
  post: <T,>(path: string, body?: unknown, idempotencyKey?: string) =>
    apiRequest<T>(path, { method: "POST", body, idempotencyKey }),
  patch: <T,>(path: string, body?: unknown) => apiRequest<T>(path, { method: "PATCH", body }),
  delete: <T,>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
};

/**
 * Uploads a single file as multipart/form-data. Deliberately bypasses
 * apiRequest (which always JSON-encodes) — the browser must set its own
 * `Content-Type: multipart/form-data; boundary=...` header, which it can
 * only do when we don't set Content-Type ourselves. The CSRF header is
 * still attached, same as any other state-changing request.
 */
export async function uploadFile(path: string, file: File): Promise<{ url: string; key: string }> {
  const csrfToken = getCookie("csrf_token");
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers: csrfToken ? { "X-CSRF-Token": csrfToken } : undefined,
    body: formData,
  });

  const contentType = res.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json") ? await res.json() : undefined;

  if (!res.ok) {
    const err = data?.error ?? { code: "UNKNOWN_ERROR", message: "Upload failed" };
    throw new ApiError(res.status, err.code, err.message);
  }

  return data as { url: string; key: string };
}
