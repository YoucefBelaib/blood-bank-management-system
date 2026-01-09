import { scrypt, randomBytes, timingSafeEqual, createHash } from "crypto";
import { promisify } from "util";
import type { IHospitalRepository } from "../domain/repositories/HospitalRepository";
import type { IBloodRequestRepository } from "../domain/repositories/BloodRequestRepository";
import type { IStatisticsRepository } from "../domain/repositories/StatisticsRepository";
import type { IPasswordResetTokenRepository } from "../domain/repositories/PasswordResetTokenRepository";
import type { IEmailService } from "../infrastructure/email/email.service";
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

// Password reset token expiration time in milliseconds (30 minutes)
const PASSWORD_RESET_TOKEN_EXPIRY_MS = 30 * 60 * 1000;

export interface HospitalLoginResult {
  hospital: HospitalDTO;
  sessionHospitalId: string;
}

export interface HospitalSignupResult {
  hospital: HospitalDTO;
  message: string;
}

export interface PasswordResetRequestResult {
  message: string;
}

export interface ValidateResetTokenResult {
  valid: boolean;
  hospitalId?: string;
}

export interface ResetPasswordResult {
  success: boolean;
  message: string;
}

export class HospitalService {
  constructor(
    private hospitalRepository: IHospitalRepository,
    private bloodRequestRepository: IBloodRequestRepository,
    private statisticsRepository: IStatisticsRepository,
    private passwordResetTokenRepository?: IPasswordResetTokenRepository,
    private emailService?: IEmailService
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

  // ===== Password Reset Methods =====

  /**
   * Generates a cryptographically secure random token for password reset.
   * Returns both the raw token (to send in email) and its hash (to store in DB).
   */
  private generateResetToken(): { token: string; tokenHash: string } {
    // Generate 32 bytes of random data, convert to URL-safe base64
    const token = randomBytes(32).toString("base64url");
    // Store SHA-256 hash of the token in the database
    const tokenHash = createHash("sha256").update(token).digest("hex");
    return { token, tokenHash };
  }

  /**
   * Hashes a reset token for lookup in the database.
   */
  private hashResetToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  /**
   * Initiates password reset flow by generating a token and sending an email.
   * SECURITY: Always returns success message regardless of whether email exists
   * to prevent user enumeration attacks.
   */
  async requestPasswordReset(
    email: string
  ): Promise<PasswordResetRequestResult> {
    if (!this.passwordResetTokenRepository || !this.emailService) {
      throw new ValidationError("Password reset service is not configured");
    }

    if (!email) {
      throw new ValidationError("Email is required");
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Look up hospital by email
    const hospital = await this.hospitalRepository.findByEmail(normalizedEmail);

    // SECURITY: Always return the same response regardless of whether the email exists
    // This prevents user enumeration attacks
    if (!hospital) {
      // Log for auditing but don't reveal to user
      console.log(
        `Password reset requested for non-existent email: ${normalizedEmail}`
      );
      return {
        message:
          "If an account exists for this email, a password reset link has been sent.",
      };
    }

    // Invalidate any existing tokens for this hospital
    await this.passwordResetTokenRepository.invalidateAllForHospital(
      hospital.id
    );

    // Generate new token
    const { token, tokenHash } = this.generateResetToken();
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRY_MS);

    // Store hashed token in database
    await this.passwordResetTokenRepository.create({
      hospitalId: hospital.id,
      tokenHash,
      expiresAt,
    });

    // Send email with the raw token (not the hash)
    await this.emailService.sendPasswordResetEmail(
      hospital.email,
      hospital.name,
      token
    );

    // Log for auditing (without sensitive data)
    console.log(`Password reset email sent for hospital: ${hospital.id}`);

    return {
      message:
        "If an account exists for this email, a password reset link has been sent.",
    };
  }

  /**
   * Validates a password reset token.
   * Returns whether the token is valid and the associated hospital ID.
   */
  async validateResetToken(token: string): Promise<ValidateResetTokenResult> {
    if (!this.passwordResetTokenRepository) {
      throw new ValidationError("Password reset service is not configured");
    }

    if (!token) {
      return { valid: false };
    }

    // Hash the provided token to look up in database
    const tokenHash = this.hashResetToken(token);
    const storedToken =
      await this.passwordResetTokenRepository.findValidByTokenHash(tokenHash);

    if (!storedToken) {
      return { valid: false };
    }

    return {
      valid: true,
      hospitalId: storedToken.hospitalId,
    };
  }

  /**
   * Resets the password using a valid reset token.
   * SECURITY: Token is invalidated after successful use.
   */
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<ResetPasswordResult> {
    if (!this.passwordResetTokenRepository) {
      throw new ValidationError("Password reset service is not configured");
    }

    if (!token || !newPassword) {
      throw new ValidationError("Token and new password are required");
    }

    if (newPassword.length < 6) {
      throw new ValidationError("Password must be at least 6 characters long");
    }

    // Validate token
    const tokenHash = this.hashResetToken(token);
    const storedToken =
      await this.passwordResetTokenRepository.findValidByTokenHash(tokenHash);

    if (!storedToken) {
      throw new UnauthorizedError("Invalid or expired reset token");
    }

    // Get the hospital
    const hospital = await this.hospitalRepository.findById(
      storedToken.hospitalId
    );
    if (!hospital) {
      throw new NotFoundError("Hospital not found");
    }

    // Hash the new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update password in database
    // Note: We need to add an updatePassword method to the repository
    await this.hospitalRepository.updatePassword(hospital.id, hashedPassword);

    // Mark token as used
    await this.passwordResetTokenRepository.markAsUsed(storedToken.id);

    // Log for auditing
    console.log(`Password successfully reset for hospital: ${hospital.id}`);

    return {
      success: true,
      message: "Password has been reset successfully",
    };
  }
}
