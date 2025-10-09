import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Error as MongooseError } from "mongoose";

export class AppError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status = 400, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({ errors: err.flatten() });
  }
  if (err instanceof MongooseError.CastError) {
    return res.status(400).json({ error: "Invalid id format" });
  }
  if (err instanceof MongooseError.ValidationError) {
    return res
      .status(400)
      .json({ error: "Validation error", details: err.errors });
  }
  if (err?.code === 11000) {
    const fields = Object.keys(err.keyPattern ?? err.keyValue ?? {});
    return res.status(409).json({ error: "Duplicate key", fields });
  }
  if (err?.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid token" });
  }
  if (err?.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Token expired" });
  }
  console.error(err);
  return res.status(500).json({ error: "Internal error" });
}
