import type { IStatisticsRepository } from "../domain/repositories/StatisticsRepository";
import type { IDonorRepository } from "../domain/repositories/DonorRepository";
import type { IHospitalRepository } from "../domain/repositories/HospitalRepository";
import type { IBloodRequestRepository } from "../domain/repositories/BloodRequestRepository";
import type {
  Statistics,
  DashboardStats,
  BloodInventory,
} from "../domain/entities";

export class StatisticsService {
  constructor(
    private statisticsRepository: IStatisticsRepository,
    private donorRepository: IDonorRepository,
    private hospitalRepository: IHospitalRepository,
    private bloodRequestRepository: IBloodRequestRepository
  ) {}

  async getStatistics(): Promise<Statistics | null> {
    const stats = await this.statisticsRepository.get();
    return stats || null;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const [stats, donors, hospitals, requests, inventory] = await Promise.all([
      this.statisticsRepository.get(),
      this.donorRepository.findAll(),
      this.hospitalRepository.findAll(),
      this.bloodRequestRepository.findAll(),
      this.statisticsRepository.getBloodInventory(),
    ]);

    const pendingRequests = requests.filter(
      (r) => r.status === "pending"
    ).length;
    const approvedRequests = requests.filter(
      (r) => r.status === "approved"
    ).length;
    const totalPending = hospitals.filter((h) => h.status === "pending").length;

    // Group donors by blood type
    const donorsByBloodType = Object.entries(
      donors.reduce((acc, donor) => {
        acc[donor.bloodType] = (acc[donor.bloodType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value }));

    // Group donors by location
    const donorsByLocation = Object.entries(
      donors.reduce((acc, donor) => {
        acc[donor.location] = (acc[donor.location] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value }));

    return {
      donorsByBloodType,
      donorsByLocation,
      totalDonors: donors.length,
      monthlyDonorStats: [], // Would need to be calculated from actual data
      totalHospitals: hospitals.length,
      totalPending,
      pendingRequests,
      approvedRequests,
      statistics: stats || null,
      bloodInventory: inventory,
    };
  }

  async getBloodInventory(): Promise<BloodInventory[]> {
    return this.statisticsRepository.getBloodInventory();
  }
}
