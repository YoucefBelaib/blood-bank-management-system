import type { Donor, CreateDonorInput } from "../entities/Donor";

export interface IDonorRepository {
  findAll(): Promise<Donor[]>;
  findById(id: string): Promise<Donor | undefined>;
  create(data: CreateDonorInput): Promise<Donor>;
  delete(id: string): Promise<boolean>;
}
