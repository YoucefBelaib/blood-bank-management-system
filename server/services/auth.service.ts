import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import type { IUserRepository } from "../domain/repositories/UserRepository";
import type { User, UserDTO, toUserDTO } from "../domain/entities/User";
import {
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ValidationError,
} from "../domain/errors";

const scryptAsync = promisify(scrypt);

export interface LoginResult {
  user: UserDTO;
  sessionUserId: string;
}

export interface SignupResult {
  user: UserDTO;
  message: string;
}

export class AuthService {
  constructor(private userRepository: IUserRepository) {}

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
}
