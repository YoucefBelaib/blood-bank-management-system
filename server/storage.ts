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
  users,
  donors,
  bloodInventory,
  bloodRequests,
  statistics,
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

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createDonor(donor: InsertDonor): Promise<Donor>;
  getBloodInventory(): Promise<BloodInventory[]>;
  getStatistics(): Promise<Statistics | undefined>;
  createBloodRequest(request: InsertBloodRequest): Promise<BloodRequest>;
  getBloodRequests(): Promise<BloodRequest[]>;
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
