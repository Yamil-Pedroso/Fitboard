import { Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { SetAdminDto } from "../dto/dtos";
import { User } from "../models/User";
import type { AuthRequest } from "../middlewares/requireAdmin";
import mongoose from "mongoose";
import { Meal } from "../models/Meal";
import { Recipe } from "../models/Recipe";
import { Routine } from "../models/Routine";
import { Progress } from "../models/Progress";

export const setIsAdmin = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { isAdmin } = SetAdminDto.parse(req.body);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isAdmin } },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.toSafeJSON());
  }
);

export const deactivateUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (req.params.id === req.auth!.userId) {
      return res
        .status(400)
        .json({ error: "Admins cannot deactivate themselves" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { active: false /* optional */ /* deletedAt: new Date() */ } },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.toSafeJSON());
  }
);

export const deleteUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (req.params.id === req.auth!.userId) {
      return res.status(400).json({ error: "Admins cannot delete themselves" });
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await Meal.deleteMany({ userId: req.params.id }).session(session);
        await Recipe.deleteMany({ userId: req.params.id }).session(session);
        await Routine.deleteMany({ userId: req.params.id }).session(session);
        await Progress.deleteMany({ userId: req.params.id }).session(session);

        const { deletedCount } = await User.deleteOne({
          _id: req.params.id,
        }).session(session);
        if (!deletedCount) throw new Error("User not found");
      });
      res.json({ ok: true });
    } finally {
      session.endSession();
    }
  }
);
