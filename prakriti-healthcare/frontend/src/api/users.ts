import { api } from "./client";

export const usersApi = {
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<{ message: string }>("/api/users/me/change-password", { currentPassword, newPassword }),
};
