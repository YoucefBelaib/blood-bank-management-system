import { scrypt, randomBytes, timingSafeEqual, createHash } from "crypto";
import { promisify } from "util";
import type { IUserRepository } from "../domain/repositories/UserRepository";
import type { IUserPasswordResetTokenRepository } from "../domain/repositories/UserPasswordResetTokenRepository";
import type { IEmailService } from "../infrastructure/email/email.service";
import type { User, UserDTO, toUserDTO } from "../domain/entities/User";
import {
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ValidationError,
} from "../domain/errors";

const scryptAsync = promisify(scrypt);

// Password reset token expiration time in milliseconds (30 minutes)
const PASSWORD_RESET_TOKEN_EXPIRY_MS = 30 * 60 * 1000;

export interface LoginResult {
  user: UserDTO;
  sessionUserId: string;
}

export interface SignupResult {
  user: UserDTO;
  message: string;
}

export interface PasswordResetRequestResult {
  message: string;
}

export interface ValidateResetTokenResult {
  valid: boolean;
  userId?: string;
}

export interface ResetPasswordResult {
  success: boolean;
  message: string;
}

export class AuthService {
  constructor(
    private userRepository: IUserRepository,
    private userPasswordResetTokenRepository?: IUserPasswordResetTokenRepository,
    private emailService?: IEmailService
  ) {}

  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }

  async comparePassword(
    password: string,
    storedPassword: string
  ): Promise<boolean> {
    if (!storedPassword || !storedPassword.includes(".")) {
      throw new ValidationError(
        "Invalid password format in database. Password may need to be reset."
      );
    }

    const [hashedPassword, salt] = storedPassword.split(".");

    if (!salt || !hashedPassword) {
      throw new ValidationError(
        "Invalid password format in database. Password may need to be reset."
      );
    }

    const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
    const suppliedPasswordBuf = (await scryptAsync(
      password,
      salt,
      64
    )) as Buffer;
    return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
  }

  async login(username: string, password: string): Promise<LoginResult> {
    if (!username || !password) {
      throw new ValidationError("Username and password are required");
    }

    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new UnauthorizedError("Invalid username or password");
    }

    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid username or password");
    }

    if (!user.approved) {
      throw new ForbiddenError(
        "Your account is pending approval by an administrator"
      );
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        approved: user.approved,
      },
      sessionUserId: user.id,
    };
  }

  async signup(username: string, password: string): Promise<SignupResult> {
    if (!username || !password) {
      throw new ValidationError("Username and password are required");
    }

    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) {
      throw new ConflictError("Username already exists");
    }

    const hashedPassword = await this.hashPassword(password);
    const user = await this.userRepository.create({
      username,
      password: hashedPassword,
      approved: false,
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        approved: user.approved,
      },
      message: "Account created successfully. Please wait for admin approval.",
    };
  }

  async getCurrentUser(userId: string | undefined): Promise<UserDTO | null> {
    if (!userId) {
      return null;
    }

    const user = await this.userRepository.findById(userId);
    if (!user || !user.approved) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      approved: user.approved,
    };
  }

  async getAllAdmins(): Promise<UserDTO[]> {
    const users = await this.userRepository.findAll();
    return users.map((user) => ({
      id: user.id,
      username: user.username,
      approved: user.approved,
    }));
  }

  async approveAdmin(id: string): Promise<UserDTO> {
    const user = await this.userRepository.approve(id);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    return {
      id: user.id,
      username: user.username,
      approved: user.approved,
    };
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
   * SECURITY: Always returns success message regardless of whether username exists
   * to prevent user enumeration attacks.
   *
   * Note: Since users only have usernames (not emails), this will log the reset link
   * in development mode. In production, you would need to add an email field to users.
   */
  async requestPasswordReset(
    username: string
  ): Promise<PasswordResetRequestResult> {
    if (!this.userPasswordResetTokenRepository || !this.emailService) {
      throw new ValidationError("Password reset service is not configured");
    }

    if (!username) {
      throw new ValidationError("Username is required");
    }

    // Normalize username
    const normalizedUsername = username.toLowerCase().trim();

    // Look up user by username
    const user = await this.userRepository.findByUsername(normalizedUsername);

    // SECURITY: Always return the same response regardless of whether the user exists
    // This prevents user enumeration attacks
    if (!user) {
      console.log(
        `Password reset requested for non-existent username: ${normalizedUsername}`
      );
      return {
        message:
          "If an account exists for this username, a password reset link has been sent.",
      };
    }

    // Invalidate any existing tokens for this user
    await this.userPasswordResetTokenRepository.invalidateAllForUser(user.id);

    // Generate new token
    const { token, tokenHash } = this.generateResetToken();
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRY_MS);

    // Store hashed token in database
    await this.userPasswordResetTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    // Send email with the raw token (not the hash)
    // Note: For admin users, we use a placeholder email since users table doesn't have email
    // In production, you would want to add an email field to the users table
    await this.emailService.sendUserPasswordResetEmail(user.username, token);

    // Log for auditing (without sensitive data)
    console.log(`Password reset email sent for user: ${user.id}`);

    return {
      message:
        "If an account exists for this username, a password reset link has been sent.",
    };
  }

  /**
   * Validates a password reset token.
   * Returns whether the token is valid and the associated user ID.
   */
  async validateResetToken(token: string): Promise<ValidateResetTokenResult> {
    if (!this.userPasswordResetTokenRepository) {
      throw new ValidationError("Password reset service is not configured");
    }

    if (!token) {
      return { valid: false };
    }

    // Hash the provided token to look up in database
    const tokenHash = this.hashResetToken(token);
    const storedToken =
      await this.userPasswordResetTokenRepository.findValidByTokenHash(
        tokenHash
      );

    if (!storedToken) {
      return { valid: false };
    }

    return {
      valid: true,
      userId: storedToken.userId,
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
    if (!this.userPasswordResetTokenRepository) {
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
      await this.userPasswordResetTokenRepository.findValidByTokenHash(
        tokenHash
      );

    if (!storedToken) {
      throw new UnauthorizedError("Invalid or expired reset token");
    }

    // Get the user
    const user = await this.userRepository.findById(storedToken.userId);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    // Hash the new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update password in database
    await this.userRepository.updatePassword(user.id, hashedPassword);

    // Mark token as used
    await this.userPasswordResetTokenRepository.markAsUsed(storedToken.id);

    // Log for auditing
    console.log(`Password successfully reset for user: ${user.id}`);

    return {
      success: true,
      message: "Password has been reset successfully",
    };
  }
}
