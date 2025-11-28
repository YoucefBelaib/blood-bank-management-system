import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
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
  users,
  donors,
  bloodInventory,
  bloodRequests,
  statistics,
} from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const pool = process.env.DATABASE_URL 
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

export const db = pool ? drizzle({ client: pool }) : null as any;

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
}

export class DatabaseStorage implements IStorage {
  private ensureDb() {
    if (!db) {
      throw new Error("Database not configured. Please set DATABASE_URL environment variable.");
    }
    return db;
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
}

export const storage = new DatabaseStorage();
