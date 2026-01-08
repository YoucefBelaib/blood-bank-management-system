import { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../domain/errors";
import { DrizzleUserRepository } from "../infrastructure/database/repositories";

const userRepository = new DrizzleUserRepository();

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.session?.userId) {
    throw new UnauthorizedError(
      "You must be logged in to access this resource"
    );
  }

  const user = await userRepository.findById(req.session.userId);
  if (!user) {
    throw new UnauthorizedError("User not found");
  }

  if (!user.approved) {
    throw new ForbiddenError("Your account is pending approval");
  }

  next();
}
