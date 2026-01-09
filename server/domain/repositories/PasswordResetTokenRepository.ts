import type { PasswordResetToken } from "@shared/schema";

export interface CreatePasswordResetTokenInput {
  hospitalId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface IPasswordResetTokenRepository {
  /**
   * Creates a new password reset token
   */
  create(data: CreatePasswordResetTokenInput): Promise<PasswordResetToken>;

  /**
   * Finds a valid (not expired, not used) token by its hash
   */
  findValidByTokenHash(
    tokenHash: string
  ): Promise<PasswordResetToken | undefined>;

  /**
   * Marks a token as used (sets usedAt timestamp)
   */
  markAsUsed(id: string): Promise<void>;

  /**
   * Invalidates all existing tokens for a hospital (called when new reset is requested)
   */
  invalidateAllForHospital(hospitalId: string): Promise<void>;

  /**
   * Deletes expired tokens (for cleanup)
   */
  deleteExpired(): Promise<number>;
}
