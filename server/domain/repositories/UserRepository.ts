import type { User } from "../entities/User";

export interface IUserRepository {
  findById(id: string): Promise<User | undefined>;
  findByUsername(username: string): Promise<User | undefined>;
  create(data: {
    username: string;
    password: string;
    approved?: boolean;
  }): Promise<User>;
  findAll(): Promise<User[]>;
  approve(id: string): Promise<User | undefined>;
}
