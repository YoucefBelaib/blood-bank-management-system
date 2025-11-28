import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { eq, desc, and, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  type User,
  type InsertUser,
  type Donor,
  type InsertDonor,
  type BloodInventory,
  type BloodRequest,
  type InsertBloodRequest,
  type Statistics,
  type Session,
  type InventoryLog,
  users,
  donors,
  bloodInventory,
  bloodRequests,
  statistics,
  sessions,
  inventoryLogs,
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
  updateBloodInventory(bloodType: string, changeAmount: number, adminId: string, reason?: string): Promise<BloodInventory | undefined>;
  getInventoryLogs(): Promise<InventoryLog[]>;
  getStatistics(): Promise<Statistics | undefined>;
  createBloodRequest(request: InsertBloodRequest): Promise<BloodRequest>;
  getBloodRequests(): Promise<BloodRequest[]>;
  seedInitialAdmin(): Promise<void>;
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

  async createUser(username: string, password: string, email?: string, role: string = "donor"): Promise<User> {
    const database = this.ensureDb();
    const hashedPassword = await bcrypt.hash(password, 10);
    const isApproved = role === "donor";
    const result = await database.insert(users).values({
      username,
      password: hashedPassword,
      email: email || null,
      role,
      isApproved,
    }).returning();
    return result[0];
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async createSession(userId: string): Promise<Session> {
    const database = this.ensureDb();
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const result = await database.insert(sessions).values({
      userId,
      token,
      expiresAt,
    }).returning();
    return result[0];
  }

  async getSession(token: string): Promise<Session | undefined> {
    const database = this.ensureDb();
    const result = await database.select().from(sessions).where(eq(sessions.token, token));
    if (result[0]) {
      const expiresAt = new Date(result[0].expiresAt);
      if (expiresAt > new Date()) {
        return result[0];
      }
      await database.delete(sessions).where(eq(sessions.token, token));
    }
    return undefined;
  }

  async deleteSession(token: string): Promise<void> {
    const database = this.ensureDb();
    await database.delete(sessions).where(eq(sessions.token, token));
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    const database = this.ensureDb();
    await database.update(users).set({ lastLogin: new Date() }).where(eq(users.id, userId));
  }

  async getAllUsers(): Promise<User[]> {
    const database = this.ensureDb();
    return await database.select().from(users).orderBy(desc(users.createdAt));
  }

  async approveUser(userId: string, adminId: string): Promise<User | undefined> {
    const database = this.ensureDb();
    const result = await database.update(users).set({
      isApproved: true,
      approvedBy: adminId,
    }).where(eq(users.id, userId)).returning();
    return result[0];
  }

  async createDonor(insertDonor: InsertDonor, userId?: string): Promise<Donor> {
    const database = this.ensureDb();
    const result = await database.insert(donors).values({
      ...insertDonor,
      userId: userId || null,
    }).returning();
    
    return result[0];
  }

  async getDonors(): Promise<Donor[]> {
    const database = this.ensureDb();
    return await database.select().from(donors).orderBy(desc(donors.createdAt));
  }

  async getDonorsByUserId(userId: string): Promise<Donor[]> {
    const database = this.ensureDb();
    return await database.select().from(donors).where(eq(donors.userId, userId));
  }

  async approveDonor(donorId: string, adminId: string): Promise<Donor | undefined> {
    const database = this.ensureDb();
    const result = await database.update(donors).set({
      status: "approved",
      approvedBy: adminId,
      approvedAt: new Date(),
    }).where(eq(donors.id, donorId)).returning();
    
    if (result[0]) {
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

  async updateBloodInventory(bloodType: string, changeAmount: number, adminId: string, reason?: string): Promise<BloodInventory | undefined> {
    const database = this.ensureDb();
    
    const existing = await database.select().from(bloodInventory).where(eq(bloodInventory.bloodType, bloodType));
    if (!existing[0]) return undefined;
    
    const previousUnits = existing[0].unitsAvailable;
    const newUnits = Math.max(0, previousUnits + changeAmount);
    
    let status = "Available";
    if (newUnits === 0) status = "Critical";
    else if (newUnits < 10) status = "Low";
    
    await database.insert(inventoryLogs).values({
      bloodType,
      changeAmount,
      previousUnits,
      newUnits,
      reason: reason || null,
      adminId,
    });
    
    const result = await database.update(bloodInventory).set({
      unitsAvailable: newUnits,
      status,
      lastUpdated: new Date(),
    }).where(eq(bloodInventory.bloodType, bloodType)).returning();
    
    const stats = await this.getStatistics();
    if (stats) {
      const allInventory = await this.getBloodInventory();
      const totalUnits = allInventory.reduce((sum, inv) => sum + inv.unitsAvailable, 0);
      await database.update(statistics).set({
        totalBloodUnits: totalUnits,
        lastUpdated: new Date(),
      }).where(eq(statistics.id, stats.id));
    }
    
    return result[0];
  }

  async getInventoryLogs(): Promise<InventoryLog[]> {
    const database = this.ensureDb();
    return await database.select().from(inventoryLogs).orderBy(desc(inventoryLogs.createdAt));
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
    return await database.select().from(bloodRequests).orderBy(desc(bloodRequests.createdAt));
  }

  async approveBloodRequest(requestId: string): Promise<BloodRequest | undefined> {
    const database = this.ensureDb();
    const result = await database.update(bloodRequests).set({
      status: "approved",
    }).where(eq(bloodRequests.id, requestId)).returning();
    return result[0];
  }

  async rejectBloodRequest(requestId: string): Promise<BloodRequest | undefined> {
    const database = this.ensureDb();
    const result = await database.update(bloodRequests).set({
      status: "rejected",
    }).where(eq(bloodRequests.id, requestId)).returning();
    return result[0];
  }

  async seedInitialAdmin(): Promise<void> {
    const database = this.ensureDb();
    const existingAdmin = await this.getUserByUsername("admin");
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("yousef", 10);
      await database.insert(users).values({
        username: "admin",
        password: hashedPassword,
        role: "admin",
        isApproved: true,
      });
      console.log("Initial admin user created (username: admin)");
    }
  }
}

export const storage = new DatabaseStorage();
