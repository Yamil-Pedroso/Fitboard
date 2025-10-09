import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { User } from "../models/User";

export const makeMeAdmin = asyncHandler(
  async (req: Request & { auth?: { userId: string } }, res: Response) => {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({ error: "Not allowed in production" });
    }
    const secret = req.headers["x-admin-secret"];
    if (secret !== process.env.DEV_ADMIN_SECRET) {
      return res.status(401).json({ error: "Invalid secret" });
    }

    // Opcional: solo permitir si aún no existe ningún admin
    // const exists = await User.exists({ isAdmin: true });
    // if (exists) return res.status(403).json({ error: "Admin already exists" });

    const user = await User.findByIdAndUpdate(
      req.auth!.userId,
      { $set: { isAdmin: true } },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user.toSafeJSON());
  }
);
