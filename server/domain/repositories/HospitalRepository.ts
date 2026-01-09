import type { Hospital, CreateHospitalInput } from "../entities/Hospital";

export interface IHospitalRepository {
  findAll(): Promise<Hospital[]>;
  findById(id: string): Promise<Hospital | undefined>;
  findByEmail(email: string): Promise<Hospital | undefined>;
  create(data: CreateHospitalInput): Promise<Hospital>;
  updateStatus(id: string, status: string): Promise<Hospital | undefined>;
  updatePassword(
    id: string,
    hashedPassword: string
  ): Promise<Hospital | undefined>;
}
