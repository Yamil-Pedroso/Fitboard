import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";

export type AuthRequest = Request & {
  auth?: { userId: string; isAdmin?: boolean };
};

export async function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });
  // Verifica contra DB (más seguro que confiar solo en el claim del token)
  const me = await User.findById(req.auth.userId).lean();
  if (!me?.isAdmin) return res.status(403).json({ error: "Forbidden" });
  next();
}
