import { eq } from "drizzle-orm";
import { getDb } from "../drizzle";
import { statistics, bloodInventory } from "@shared/schema";
import type { IStatisticsRepository } from "../../../domain/repositories/StatisticsRepository";
import type { Statistics, BloodInventory } from "../../../domain/entities";

export class DrizzleStatisticsRepository implements IStatisticsRepository {
  async get(): Promise<Statistics | undefined> {
    const db = getDb();
    const result = await db.select().from(statistics);
    return result[0] as Statistics | undefined;
  }

  async incrementActiveDonors(): Promise<void> {
    const db = getDb();
    const stats = await this.get();
    if (stats) {
      await db
        .update(statistics)
        .set({
          activeDonors: stats.activeDonors + 1,
          lastUpdated: new Date(),
        })
        .where(eq(statistics.id, stats.id));
    }
  }

  async incrementPartnerHospitals(): Promise<void> {
    const db = getDb();
    const stats = await this.get();
    if (stats) {
      await db
        .update(statistics)
        .set({
          partnerHospitals: stats.partnerHospitals + 1,
          lastUpdated: new Date(),
        })
        .where(eq(statistics.id, stats.id));
    }
  }

  async getBloodInventory(): Promise<BloodInventory[]> {
    const db = getDb();
    const result = await db.select().from(bloodInventory);
    return result as BloodInventory[];
  }
}
