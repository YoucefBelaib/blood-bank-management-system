import { apiClient } from "./client";
import type { User, LoginResponse, SignupResponse } from "@/types";

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
};
