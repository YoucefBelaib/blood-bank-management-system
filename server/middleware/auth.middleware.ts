import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../domain/errors";

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.session?.userId) {
    throw new UnauthorizedError(
      "You must be logged in to access this resource"
    );
  }
  next();
}

export function requireHospitalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.session?.hospitalId) {
    throw new UnauthorizedError(
      "You must be logged in as a hospital to access this resource"
    );
  }
  next();
}
