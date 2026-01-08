import { Request, Response, NextFunction } from "express";
import { AppError } from "../domain/errors";
import { logger } from "../infrastructure/logger/logger";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
    return;
  }

  // Handle unexpected errors
  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
    code: "INTERNAL_ERROR",
  });
}
