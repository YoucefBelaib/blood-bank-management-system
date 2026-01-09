import { eq } from "drizzle-orm";
import { getDb } from "../drizzle";
import { hospitals } from "@shared/schema";
import type { IHospitalRepository } from "../../../domain/repositories/HospitalRepository";
import type {
  Hospital,
  CreateHospitalInput,
} from "../../../domain/entities/Hospital";

export class DrizzleHospitalRepository implements IHospitalRepository {
  async findAll(): Promise<Hospital[]> {
    const db = getDb();
    const result = await db.select().from(hospitals);
    return result as Hospital[];
  }

  async findById(id: string): Promise<Hospital | undefined> {
    const db = getDb();
    const result = await db
      .select()
      .from(hospitals)
      .where(eq(hospitals.id, id));
    return result[0] as Hospital | undefined;
  }

  async findByEmail(email: string): Promise<Hospital | undefined> {
    const db = getDb();
    const result = await db
      .select()
      .from(hospitals)
      .where(eq(hospitals.email, email));
    return result[0] as Hospital | undefined;
  }

  async create(data: CreateHospitalInput): Promise<Hospital> {
    const db = getDb();
    const result = await db.insert(hospitals).values(data).returning();
    return result[0] as Hospital;
  }

  async updateStatus(
    id: string,
    status: string
  ): Promise<Hospital | undefined> {
    const db = getDb();
    const result = await db
      .update(hospitals)
      .set({ status })
      .where(eq(hospitals.id, id))
      .returning();
    return result[0] as Hospital | undefined;
  }

  async updatePassword(
    id: string,
    hashedPassword: string
  ): Promise<Hospital | undefined> {
    const db = getDb();
    const result = await db
      .update(hospitals)
      .set({ password: hashedPassword })
      .where(eq(hospitals.id, id))
      .returning();
    return result[0] as Hospital | undefined;
  }
}
