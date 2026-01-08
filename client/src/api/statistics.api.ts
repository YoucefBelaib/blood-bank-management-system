import { apiClient } from "./client";
import type { Statistics, DashboardStats, BloodInventory } from "@/types";

export const statisticsApi = {
  getStatistics: (): Promise<Statistics> => {
    return apiClient.get<Statistics>("/statistics");
  },

  getDashboardStats: (): Promise<DashboardStats> => {
    return apiClient.get<DashboardStats>("/statistics/dashboard");
  },

  getBloodInventory: (): Promise<BloodInventory[]> => {
    return apiClient.get<BloodInventory[]>("/statistics/inventory");
  },
};
