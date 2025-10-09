import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
export async function requireActiveUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });

  // más eficiente con exists:
  const isActive = await User.exists({ _id: req.auth.userId, active: true });
  if (!isActive) return res.status(403).json({ error: "Account disabled" });

  next();
}
