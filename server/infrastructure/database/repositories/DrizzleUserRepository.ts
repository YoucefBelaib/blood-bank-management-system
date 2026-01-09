import { eq } from "drizzle-orm";
import { getDb } from "../drizzle";
import { users } from "@shared/schema";
import type { IUserRepository } from "../../../domain/repositories/UserRepository";
import type { User } from "../../../domain/entities/User";

export class DrizzleUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | undefined> {
    const db = getDb();
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] as User | undefined;
  }

  async findByUsername(username: string): Promise<User | undefined> {
    const db = getDb();
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return result[0] as User | undefined;
  }

  async create(data: {
    username: string;
    password: string;
    approved?: boolean;
  }): Promise<User> {
    const db = getDb();
    const result = await db.insert(users).values(data).returning();
    return result[0] as User;
  }

  async findAll(): Promise<User[]> {
    const db = getDb();
    const result = await db.select().from(users);
    return result as User[];
  }

  async approve(id: string): Promise<User | undefined> {
    const db = getDb();
    const result = await db
      .update(users)
      .set({ approved: true })
      .where(eq(users.id, id))
      .returning();
    return result[0] as User | undefined;
  }

  async updatePassword(
    id: string,
    hashedPassword: string
  ): Promise<User | undefined> {
    const db = getDb();
    const result = await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id))
      .returning();
    return result[0] as User | undefined;
  }
}
