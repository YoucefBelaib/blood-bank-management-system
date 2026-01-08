import type { BloodInventory } from "./BloodInventory";

export interface Statistics {
  id: string;
  activeDonors: number;
  totalBloodUnits: number;
  partnerHospitals: number;
  lastUpdated: Date;
}

export interface DashboardStats {
  donorsByBloodType: { name: string; value: number }[];
  donorsByLocation: { name: string; value: number }[];
  totalDonors: number;
  monthlyDonorStats: { month: string; thisYear: number; lastYear: number }[];
  totalHospitals: number;
  totalPending: number;
  pendingRequests: number;
  approvedRequests: number;
  statistics: Statistics | null;
  bloodInventory: BloodInventory[];
}
