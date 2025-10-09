import { ZodObject, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export const validateBody =
  (schema: ZodObject<any>) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (e) {
      next(e);
    }
  };
