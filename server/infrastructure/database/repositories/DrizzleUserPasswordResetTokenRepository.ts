import { eq, and, isNull } from "drizzle-orm";
import { getDb } from "../drizzle";
import { userPasswordResetTokens } from "@shared/schema";
import type {
  IUserPasswordResetTokenRepository,
  CreateUserPasswordResetTokenInput,
} from "../../../domain/repositories/UserPasswordResetTokenRepository";
import type { UserPasswordResetToken } from "@shared/schema";

export class DrizzleUserPasswordResetTokenRepository
  implements IUserPasswordResetTokenRepository
{
  async create(
    data: CreateUserPasswordResetTokenInput
  ): Promise<UserPasswordResetToken> {
    const db = getDb();
    const result = await db
      .insert(userPasswordResetTokens)
      .values({
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      })
      .returning();
    return result[0];
  }

  async findValidByTokenHash(
    tokenHash: string
  ): Promise<UserPasswordResetToken | undefined> {
    const db = getDb();
    const now = new Date();
    const result = await db
      .select()
      .from(userPasswordResetTokens)
      .where(
        and(
          eq(userPasswordResetTokens.tokenHash, tokenHash),
          isNull(userPasswordResetTokens.usedAt)
        )
      );

    // Filter for not expired tokens
    const token = result.find((t) => new Date(t.expiresAt) > now);
    return token;
  }

  async markAsUsed(id: string): Promise<void> {
    const db = getDb();
    await db
      .update(userPasswordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(userPasswordResetTokens.id, id));
  }

  async invalidateAllForUser(userId: string): Promise<void> {
    const db = getDb();
    // Mark all unused tokens as used (effectively invalidating them)
    await db
      .update(userPasswordResetTokens)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(userPasswordResetTokens.userId, userId),
          isNull(userPasswordResetTokens.usedAt)
        )
      );
  }

  async deleteExpired(): Promise<number> {
    const db = getDb();
    const result = await db
      .delete(userPasswordResetTokens)
      .where(eq(userPasswordResetTokens.expiresAt, new Date()))
      .returning();
    return result.length;
  }
}
