import { api } from "./client";
import type { AuthUser } from "./types";

export const authApi = {
  register: (name: string, email: string, password: string) =>
    api.post<{ message: string; user: { id: string; name: string; email: string } }>("/api/auth/register", {
      name,
      email,
      password,
    }),
  login: (email: string, password: string, totpCode?: string) =>
    api.post<{ user?: AuthUser; requires2fa?: boolean }>("/api/auth/login", { email, password, totpCode }),
  logout: () => api.post<void>("/api/auth/logout"),
  me: () => api.get<{ user: AuthUser }>("/api/auth/me"),
  forgotPassword: (email: string) => api.post<{ message: string }>("/api/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) =>
    api.post<{ message: string }>("/api/auth/reset-password", { token, password }),
  verifyEmail: (token: string) => api.post<{ message: string }>("/api/auth/verify-email", { token }),
};
