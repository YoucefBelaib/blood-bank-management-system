import { eq } from "drizzle-orm";
import { getDb } from "../drizzle";
import { donors } from "@shared/schema";
import type { IDonorRepository } from "../../../domain/repositories/DonorRepository";
import type { Donor, CreateDonorInput } from "../../../domain/entities/Donor";

export class DrizzleDonorRepository implements IDonorRepository {
  async findAll(): Promise<Donor[]> {
    const db = getDb();
    const result = await db.select().from(donors);
    return result as Donor[];
  }

  async findById(id: string): Promise<Donor | undefined> {
    const db = getDb();
    const result = await db.select().from(donors).where(eq(donors.id, id));
    return result[0] as Donor | undefined;
  }

  async create(data: CreateDonorInput): Promise<Donor> {
    const db = getDb();
    const result = await db.insert(donors).values(data).returning();
    return result[0] as Donor;
  }

  async delete(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db.delete(donors).where(eq(donors.id, id)).returning();
    return result.length > 0;
  }
}
