import type { Statistics } from "../entities/Statistics";
import type { BloodInventory } from "../entities/BloodInventory";

export interface IStatisticsRepository {
  get(): Promise<Statistics | undefined>;
  incrementActiveDonors(): Promise<void>;
  incrementPartnerHospitals(): Promise<void>;
  getBloodInventory(): Promise<BloodInventory[]>;
}
