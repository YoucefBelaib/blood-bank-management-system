import type { IDonorRepository } from "../domain/repositories/DonorRepository";
import type { IStatisticsRepository } from "../domain/repositories/StatisticsRepository";
import type { Donor, CreateDonorInput } from "../domain/entities/Donor";
import { NotFoundError, ValidationError } from "../domain/errors";

export class DonorService {
  constructor(
    private donorRepository: IDonorRepository,
    private statisticsRepository: IStatisticsRepository
  ) {}

  async getAllDonors(): Promise<Donor[]> {
    return this.donorRepository.findAll();
  }

  async getDonorById(id: string): Promise<Donor> {
    const donor = await this.donorRepository.findById(id);
    if (!donor) {
      throw new NotFoundError("Donor not found");
    }
    return donor;
  }

  async createDonor(data: CreateDonorInput): Promise<Donor> {
    if (!data.fullName || !data.bloodType || !data.phone) {
      throw new ValidationError(
        "Full name, blood type, and phone are required"
      );
    }

    const donor = await this.donorRepository.create(data);

    // Update statistics
    await this.statisticsRepository.incrementActiveDonors();

    return donor;
  }

  async deleteDonor(id: string): Promise<void> {
    const deleted = await this.donorRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError("Donor not found");
    }
  }
}
