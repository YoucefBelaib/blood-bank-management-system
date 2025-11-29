import { drizzle } from "drizzle-orm/neon-http";
import { neon, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { eq } from "drizzle-orm";
import {
  type User,
  type InsertUser,
  type Donor,
  type InsertDonor,
  type BloodInventory,
  type BloodRequest,
  type InsertBloodRequest,
  type Statistics,
  type Hospital,
  type InsertHospital,
  users,
  donors,
  bloodInventory,
  bloodRequests,
  statistics,
  hospitals,
} from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Lazily initialize the Neon pool and Drizzle instance at runtime.
// This avoids trying to read `process.env.DATABASE_URL` at import time
// (which can happen before dotenv has been loaded in some startup flows).
let _pool: ReturnType<typeof neon> | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function initDbIfNeeded() {
  if (_db) return _db;
  if (!process.env.DATABASE_URL) return null;
  _pool = neon(process.env.DATABASE_URL);
  _db = drizzle(_pool as any);
  return _db;
}

export function getDb() {
  return initDbIfNeeded();
}

export interface DashboardStats {
  donorsByBloodType: { name: string; value: number }[];
  donorsByLocation: { name: string; value: number }[];
  totalDonors: number;
  monthlyDonorStats: { month: string; thisYear: number; lastYear: number }[];
  totalHospitals: number;
  totalPending: number;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createDonor(donor: InsertDonor): Promise<Donor>;
  getAllDonors(): Promise<Donor[]>;
  getBloodInventory(): Promise<BloodInventory[]>;
  getStatistics(): Promise<Statistics | undefined>;
  createBloodRequest(request: InsertBloodRequest): Promise<BloodRequest>;
  getBloodRequests(): Promise<BloodRequest[]>;
  updateBloodRequestStatus(id: string, status: string): Promise<BloodRequest | undefined>;
  getAllHospitals(): Promise<Hospital[]>;
  createHospital(hospital: InsertHospital): Promise<Hospital>;
  updateHospitalStatus(id: string, status: string): Promise<Hospital | undefined>;
  getHospital(id: string): Promise<Hospital | undefined>;
  getDashboardStats(): Promise<DashboardStats>;
}

export class DatabaseStorage implements IStorage {
  private ensureDb() {
    const runtimeDb = initDbIfNeeded();
    if (!runtimeDb) {
      throw new Error("Database not configured. Please set DATABASE_URL environment variable.");
    }
    return runtimeDb;
  }

  async getUser(id: string): Promise<User | undefined> {
    const database = this.ensureDb();
    const result = await database.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const database = this.ensureDb();
    const result = await database
      .select()
      .from(users)
      .where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const database = this.ensureDb();
    const result = await database.insert(users).values(insertUser).returning();
    return result[0];
  }

  async createDonor(insertDonor: InsertDonor): Promise<Donor> {
    const database = this.ensureDb();
    const result = await database.insert(donors).values(insertDonor).returning();
    
    const stats = await this.getStatistics();
    if (stats) {
      await database
        .update(statistics)
        .set({
          activeDonors: stats.activeDonors + 1,
          lastUpdated: new Date(),
        })
        .where(eq(statistics.id, stats.id));
    }
    
    return result[0];
  }

  async getAllDonors(): Promise<Donor[]> {
    const database = this.ensureDb();
    return await database.select().from(donors);
  }

  async getBloodInventory(): Promise<BloodInventory[]> {
    const database = this.ensureDb();
    return await database.select().from(bloodInventory);
  }

  async getStatistics(): Promise<Statistics | undefined> {
    const database = this.ensureDb();
    const result = await database.select().from(statistics);
    return result[0];
  }

  async createBloodRequest(
    insertRequest: InsertBloodRequest,
  ): Promise<BloodRequest> {
    const database = this.ensureDb();
    const result = await database
      .insert(bloodRequests)
      .values(insertRequest)
      .returning();
    return result[0];
  }

  async getBloodRequests(): Promise<BloodRequest[]> {
    const database = this.ensureDb();
    return await database.select().from(bloodRequests);
  }

  async updateBloodRequestStatus(id: string, status: string): Promise<BloodRequest | undefined> {
    const database = this.ensureDb();
    const result = await database
      .update(bloodRequests)
      .set({ status })
      .where(eq(bloodRequests.id, id))
      .returning();
    return result[0];
  }

  async getAllHospitals(): Promise<Hospital[]> {
    const database = this.ensureDb();
    return await database.select().from(hospitals);
  }

  async createHospital(insertHospital: InsertHospital): Promise<Hospital> {
    const database = this.ensureDb();
    const result = await database.insert(hospitals).values(insertHospital).returning();
    return result[0];
  }

  async updateHospitalStatus(id: string, status: string): Promise<Hospital | undefined> {
    const database = this.ensureDb();
    const result = await database
      .update(hospitals)
      .set({ status })
      .where(eq(hospitals.id, id))
      .returning();
    
    // Update partner hospitals count if approved
    if (status === "approved") {
      const stats = await this.getStatistics();
      if (stats) {
        await database
          .update(statistics)
          .set({
            partnerHospitals: stats.partnerHospitals + 1,
            lastUpdated: new Date(),
          })
          .where(eq(statistics.id, stats.id));
      }
    }
    
    return result[0];
  }

  async getHospital(id: string): Promise<Hospital | undefined> {
    const database = this.ensureDb();
    const result = await database.select().from(hospitals).where(eq(hospitals.id, id));
    return result[0];
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const database = this.ensureDb();
    const allDonors = await database.select().from(donors);
    
    // Aggregate donors by blood type
    const bloodTypeMap = new Map<string, number>();
    allDonors.forEach(donor => {
      const count = bloodTypeMap.get(donor.bloodType) || 0;
      bloodTypeMap.set(donor.bloodType, count + 1);
    });
    const donorsByBloodType = Array.from(bloodTypeMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));
    
    // Aggregate donors by location
    const locationMap = new Map<string, number>();
    allDonors.forEach(donor => {
      const location = donor.location || "Unknown";
      const count = locationMap.get(location) || 0;
      locationMap.set(location, count + 1);
    });
    const donorsByLocation = Array.from(locationMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 locations
    
    // Calculate monthly stats based on registration dates
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    const monthlyStats = months.map((month, index) => {
      const thisYearCount = allDonors.filter(donor => {
        const date = new Date(donor.createdAt || Date.now());
        return date.getFullYear() === currentYear && date.getMonth() === index;
      }).length;
      
      const lastYearCount = allDonors.filter(donor => {
        const date = new Date(donor.createdAt || Date.now());
        return date.getFullYear() === currentYear - 1 && date.getMonth() === index;
      }).length;
      
      return {
        month,
        thisYear: thisYearCount,
        lastYear: lastYearCount,
      };
    });
    
    // Get hospital and pending counts
    const allHospitals = await database.select().from(hospitals);
    const allBloodRequests = await database.select().from(bloodRequests);
    
    const totalHospitals = allHospitals.filter(h => h.status === "approved").length;
    const pendingHospitals = allHospitals.filter(h => h.status === "pending").length;
    const pendingRequests = allBloodRequests.filter(r => r.status === "pending").length;
    const totalPending = pendingHospitals + pendingRequests;
    
    return {
      donorsByBloodType,
      donorsByLocation,
      totalDonors: allDonors.length,
      monthlyDonorStats: monthlyStats,
      totalHospitals,
      totalPending,
    };
  }
}

export const storage = new DatabaseStorage();
