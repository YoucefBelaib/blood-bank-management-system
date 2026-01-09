import type { UserPasswordResetToken } from "@shared/schema";

export interface CreateUserPasswordResetTokenInput {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface IUserPasswordResetTokenRepository {
  /**
   * Creates a new password reset token for a user
   */
  create(
    data: CreateUserPasswordResetTokenInput
  ): Promise<UserPasswordResetToken>;

  /**
   * Finds a valid (not expired, not used) token by its hash
   */
  findValidByTokenHash(
    tokenHash: string
  ): Promise<UserPasswordResetToken | undefined>;

  /**
   * Marks a token as used (sets usedAt timestamp)
   */
  markAsUsed(id: string): Promise<void>;

  /**
   * Invalidates all existing tokens for a user (called when new reset is requested)
   */
  invalidateAllForUser(userId: string): Promise<void>;

  /**
   * Deletes expired tokens (for cleanup)
   */
  deleteExpired(): Promise<number>;
}
