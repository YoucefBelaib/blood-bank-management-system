import { apiClient } from "./client";
import type { Donor, CreateDonorInput } from "@/types";

export const donorsApi = {
  getAll: (): Promise<Donor[]> => {
    return apiClient.get<Donor[]>("/donors");
  },

  getById: (id: string): Promise<Donor> => {
    return apiClient.get<Donor>(`/donors/${id}`);
  },

  create: (data: CreateDonorInput): Promise<Donor> => {
    return apiClient.post<Donor>("/donors", data);
  },

  delete: (id: string): Promise<void> => {
    return apiClient.delete<void>(`/donors/${id}`);
  },
};
