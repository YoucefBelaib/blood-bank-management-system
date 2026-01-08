import type {
  BloodRequest,
  CreateBloodRequestInput,
} from "../entities/BloodRequest";

export interface IBloodRequestRepository {
  findAll(): Promise<BloodRequest[]>;
  findById(id: string): Promise<BloodRequest | undefined>;
  findByHospitalId(hospitalId: string): Promise<BloodRequest[]>;
  create(data: CreateBloodRequestInput): Promise<BloodRequest>;
  updateStatus(id: string, status: string): Promise<BloodRequest | undefined>;
}
