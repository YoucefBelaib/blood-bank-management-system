import { eq } from "drizzle-orm";
import { getDb } from "../drizzle";
import { bloodRequests } from "@shared/schema";
import type { IBloodRequestRepository } from "../../../domain/repositories/BloodRequestRepository";
import type {
  BloodRequest,
  CreateBloodRequestInput,
} from "../../../domain/entities/BloodRequest";

export class DrizzleBloodRequestRepository implements IBloodRequestRepository {
  async findAll(): Promise<BloodRequest[]> {
    const db = getDb();
    const result = await db.select().from(bloodRequests);
    return result as BloodRequest[];
  }

  async findById(id: string): Promise<BloodRequest | undefined> {
    const db = getDb();
    const result = await db
      .select()
      .from(bloodRequests)
      .where(eq(bloodRequests.id, id));
    return result[0] as BloodRequest | undefined;
  }

  async findByHospitalId(hospitalId: string): Promise<BloodRequest[]> {
    const db = getDb();
    const result = await db
      .select()
      .from(bloodRequests)
      .where(eq(bloodRequests.hospitalId, hospitalId));
    return result as BloodRequest[];
  }

  async create(data: CreateBloodRequestInput): Promise<BloodRequest> {
    const db = getDb();
    const result = await db.insert(bloodRequests).values(data).returning();
    return result[0] as BloodRequest;
  }

  async updateStatus(
    id: string,
    status: string
  ): Promise<BloodRequest | undefined> {
    const db = getDb();
    const result = await db
      .update(bloodRequests)
      .set({ status })
      .where(eq(bloodRequests.id, id))
      .returning();
    return result[0] as BloodRequest | undefined;
  }
}
