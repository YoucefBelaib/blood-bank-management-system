import { apiClient } from "./client";
import type {
  Hospital,
  CreateHospitalInput,
  BloodRequest,
  CreateBloodRequestInput,
} from "@/types";

export const hospitalsApi = {
  // Hospital CRUD
  getAll: (): Promise<Hospital[]> => {
    return apiClient.get<Hospital[]>("/hospitals");
  },

  getById: (id: string): Promise<Hospital> => {
    return apiClient.get<Hospital>(`/hospitals/${id}`);
  },

  updateStatus: (id: string, status: string): Promise<Hospital> => {
    return apiClient.patch<Hospital>(`/hospitals/${id}/status`, { status });
  },

  // Hospital Auth
  login: (email: string, password: string): Promise<Hospital> => {
    return apiClient.post<Hospital>("/hospitals/auth/login", {
      email,
      password,
    });
  },

  signup: (
    data: CreateHospitalInput
  ): Promise<{ hospital: Hospital; message: string }> => {
    return apiClient.post("/hospitals/auth/signup", data);
  },

  logout: (): Promise<void> => {
    return apiClient.post<void>("/hospitals/auth/logout");
  },

  getCurrentHospital: (): Promise<Hospital | null> => {
    return apiClient.get<Hospital>("/hospitals/auth/me").catch(() => null);
  },

  // Blood Requests
  getAllBloodRequests: (): Promise<BloodRequest[]> => {
    return apiClient.get<BloodRequest[]>("/hospitals/requests/all");
  },

  getHospitalBloodRequests: (): Promise<BloodRequest[]> => {
    return apiClient.get<BloodRequest[]>("/hospitals/requests");
  },

  createBloodRequest: (
    data: CreateBloodRequestInput
  ): Promise<BloodRequest> => {
    return apiClient.post<BloodRequest>("/hospitals/requests", data);
  },

  updateBloodRequestStatus: (
    id: string,
    status: string
  ): Promise<BloodRequest> => {
    return apiClient.patch<BloodRequest>(`/hospitals/requests/${id}/status`, {
      status,
    });
  },
};
