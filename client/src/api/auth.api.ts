import { apiClient } from "./client";
import type { User, LoginResponse, SignupResponse } from "@/types";

export interface PasswordResetResponse {
  message: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export const authApi = {
  login: (username: string, password: string): Promise<User> => {
    return apiClient.post<User>("/login", { username, password });
  },

  signup: (username: string, password: string): Promise<SignupResponse> => {
    return apiClient.post<SignupResponse>("/signup", { username, password });
  },

  logout: (): Promise<void> => {
    return apiClient.post<void>("/logout");
  },

  getCurrentUser: (): Promise<User | null> => {
    return apiClient.get<User>("/user").catch(() => null);
  },

  getAllAdmins: (): Promise<User[]> => {
    return apiClient.get<User[]>("/admin/users");
  },

  approveAdmin: (id: string): Promise<User> => {
    return apiClient.patch<User>(`/admin/users/${id}/approve`);
  },

  // Password Reset
  requestPasswordReset: (username: string): Promise<PasswordResetResponse> => {
    return apiClient.post<PasswordResetResponse>("/forgot-password", {
      username,
    });
  },

  validateResetToken: (token: string): Promise<ValidateTokenResponse> => {
    return apiClient.get<ValidateTokenResponse>(
      `/validate-reset-token?token=${encodeURIComponent(token)}`
    );
  },

  resetPassword: (
    token: string,
    newPassword: string
  ): Promise<ResetPasswordResponse> => {
    return apiClient.post<ResetPasswordResponse>("/reset-password", {
      token,
      newPassword,
    });
  },
};
