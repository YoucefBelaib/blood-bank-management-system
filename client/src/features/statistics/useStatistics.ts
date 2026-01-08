import { useQuery } from "@tanstack/react-query";
import { statisticsApi } from "@/api";
import type { Statistics, DashboardStats, BloodInventory } from "@/types";

export function useStatistics() {
  return useQuery<Statistics>({
    queryKey: ["statistics"],
    queryFn: statisticsApi.getStatistics,
  });
}

export function useDashboardStats() {
  const query = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: statisticsApi.getDashboardStats,
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useBloodInventory() {
  return useQuery<BloodInventory[]>({
    queryKey: ["blood-inventory"],
    queryFn: statisticsApi.getBloodInventory,
  });
}
