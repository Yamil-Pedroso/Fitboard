import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function requireAuth(
  req: Request & { auth?: any },
  res: Response,
  next: NextFunction
) {
  const hdr = req.headers.authorization;
  if (!hdr?.startsWith("Bearer "))
    return res.status(401).json({ error: "Unauthorized" });

  const token = hdr.slice("Bearer ".length);
  try {
    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    const payload = jwt.verify(token, secret) as {
      sub: string;
      isAdmin?: boolean;
    };
    req.auth = { userId: payload.sub, isAdmin: payload.isAdmin === true };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
