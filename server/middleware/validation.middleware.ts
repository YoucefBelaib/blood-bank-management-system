import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ValidationError } from "../domain/errors";

type RequestPart = "body" | "query" | "params";

export function validate(schema: z.ZodSchema, part: RequestPart = "body") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      const errorMessages = result.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      throw new ValidationError(`Validation failed: ${errorMessages}`);
    }

    req[part] = result.data;
    next();
  };
}
