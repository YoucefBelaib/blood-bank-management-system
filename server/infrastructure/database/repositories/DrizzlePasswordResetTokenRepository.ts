import { eq, lt, isNull, and } from "drizzle-orm";
import { getDb } from "../drizzle";
import { passwordResetTokens } from "@shared/schema";
import type {
  IPasswordResetTokenRepository,
  CreatePasswordResetTokenInput,
} from "../../../domain/repositories/PasswordResetTokenRepository";
import type { PasswordResetToken } from "@shared/schema";

export class DrizzlePasswordResetTokenRepository
  implements IPasswordResetTokenRepository
{
  async create(
    data: CreatePasswordResetTokenInput
  ): Promise<PasswordResetToken> {
    const db = getDb();
    const result = await db
      .insert(passwordResetTokens)
      .values({
        hospitalId: data.hospitalId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      })
      .returning();
    return result[0];
  }

  async findValidByTokenHash(
    tokenHash: string
  ): Promise<PasswordResetToken | undefined> {
    const db = getDb();
    const now = new Date();
    const result = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          isNull(passwordResetTokens.usedAt)
          // Token must not be expired (expiresAt > now)
        )
      );

    // Filter for not expired tokens in memory since Drizzle doesn't have gt for dates easily
    const token = result.find((t) => new Date(t.expiresAt) > now);
    return token;
  }

  async markAsUsed(id: string): Promise<void> {
    const db = getDb();
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, id));
  }

  async invalidateAllForHospital(hospitalId: string): Promise<void> {
    const db = getDb();
    // Mark all unused tokens as used (effectively invalidating them)
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(passwordResetTokens.hospitalId, hospitalId),
          isNull(passwordResetTokens.usedAt)
        )
      );
  }

  async deleteExpired(): Promise<number> {
    const db = getDb();
    const result = await db
      .delete(passwordResetTokens)
      .where(lt(passwordResetTokens.expiresAt, new Date()))
      .returning();
    return result.length;
  }
}
