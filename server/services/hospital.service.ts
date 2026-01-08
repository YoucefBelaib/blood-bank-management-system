import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import type { IHospitalRepository } from "../domain/repositories/HospitalRepository";
import type { IBloodRequestRepository } from "../domain/repositories/BloodRequestRepository";
import type { IStatisticsRepository } from "../domain/repositories/StatisticsRepository";
import type {
  Hospital,
  HospitalDTO,
  CreateHospitalInput,
} from "../domain/entities/Hospital";
import type {
  BloodRequest,
  CreateBloodRequestInput,
} from "../domain/entities/BloodRequest";
import {
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  ValidationError,
} from "../domain/errors";

const scryptAsync = promisify(scrypt);

export interface HospitalLoginResult {
  hospital: HospitalDTO;
  sessionHospitalId: string;
}

export interface HospitalSignupResult {
  hospital: HospitalDTO;
  message: string;
}

export class HospitalService {
  constructor(
    private hospitalRepository: IHospitalRepository,
    private bloodRequestRepository: IBloodRequestRepository,
    private statisticsRepository: IStatisticsRepository
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }

  private async comparePassword(
    password: string,
    storedPassword: string
  ): Promise<boolean> {
    const [hashedPassword, salt] = storedPassword.split(".");
    const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
    const suppliedPasswordBuf = (await scryptAsync(
      password,
      salt,
      64
    )) as Buffer;
    return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
  }

  async getAllHospitals(): Promise<Hospital[]> {
    return this.hospitalRepository.findAll();
  }

  async getHospitalById(id: string): Promise<Hospital> {
    const hospital = await this.hospitalRepository.findById(id);
    if (!hospital) {
      throw new NotFoundError("Hospital not found");
    }
    return hospital;
  }

  async login(email: string, password: string): Promise<HospitalLoginResult> {
    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    const hospital = await this.hospitalRepository.findByEmail(email);
    if (!hospital || !hospital.password) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isPasswordValid = await this.comparePassword(
      password,
      hospital.password
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    return {
      hospital: {
        id: hospital.id,
        name: hospital.name,
        location: hospital.location,
        email: hospital.email,
        phone: hospital.phone,
        address: hospital.address,
        contactPerson: hospital.contactPerson,
        status: hospital.status,
        createdAt: hospital.createdAt,
      },
      sessionHospitalId: hospital.id,
    };
  }

  async signup(
    data: CreateHospitalInput & { password: string }
  ): Promise<HospitalSignupResult> {
    if (!data.name || !data.email || !data.password) {
      throw new ValidationError("Name, email, and password are required");
    }

    const existingHospital = await this.hospitalRepository.findByEmail(
      data.email
    );
    if (existingHospital) {
      throw new ConflictError("A hospital with this email already exists");
    }

    const hashedPassword = await this.hashPassword(data.password);
    const hospital = await this.hospitalRepository.create({
      ...data,
      password: hashedPassword,
    });

    // Update statistics
    await this.statisticsRepository.incrementPartnerHospitals();

    return {
      hospital: {
        id: hospital.id,
        name: hospital.name,
        location: hospital.location,
        email: hospital.email,
        phone: hospital.phone,
        address: hospital.address,
        contactPerson: hospital.contactPerson,
        status: hospital.status,
        createdAt: hospital.createdAt,
      },
      message: "Hospital registered successfully",
    };
  }

  async getCurrentHospital(
    hospitalId: string | undefined
  ): Promise<HospitalDTO | null> {
    if (!hospitalId) {
      return null;
    }

    const hospital = await this.hospitalRepository.findById(hospitalId);
    if (!hospital) {
      return null;
    }

    return {
      id: hospital.id,
      name: hospital.name,
      location: hospital.location,
      email: hospital.email,
      phone: hospital.phone,
      address: hospital.address,
      contactPerson: hospital.contactPerson,
      status: hospital.status,
      createdAt: hospital.createdAt,
    };
  }

  async updateHospitalStatus(id: string, status: string): Promise<Hospital> {
    const hospital = await this.hospitalRepository.updateStatus(id, status);
    if (!hospital) {
      throw new NotFoundError("Hospital not found");
    }
    return hospital;
  }

  // Blood Request methods
  async getAllBloodRequests(): Promise<BloodRequest[]> {
    return this.bloodRequestRepository.findAll();
  }

  async getBloodRequestsByHospital(
    hospitalId: string
  ): Promise<BloodRequest[]> {
    return this.bloodRequestRepository.findByHospitalId(hospitalId);
  }

  async createBloodRequest(
    data: CreateBloodRequestInput
  ): Promise<BloodRequest> {
    if (!data.hospitalName || !data.bloodType || !data.unitsNeeded) {
      throw new ValidationError(
        "Hospital name, blood type, and units needed are required"
      );
    }

    return this.bloodRequestRepository.create(data);
  }

  async updateBloodRequestStatus(
    id: string,
    status: string
  ): Promise<BloodRequest> {
    const request = await this.bloodRequestRepository.updateStatus(id, status);
    if (!request) {
      throw new NotFoundError("Blood request not found");
    }
    return request;
  }
}
