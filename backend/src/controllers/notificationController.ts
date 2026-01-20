import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { Notification } from "../models/Notification";

export const listNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const notifications = await Notification.find().sort({ createdAt: -1 });

    res.status(200).json({ notifications });
  }
);

export const createNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Notification text is required" });
    }

    const notification = await Notification.create({ text });

    return res.status(200).json({
      success: true,
      notification,
    });
  }
);

export const updateNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(404).json({
        error: "Notification text is required",
      });
    }

    const updated = await Notification.findByIdAndUpdate(
      id,
      { text },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        error: "Notification not found",
      });
    }

    return res.status(200).json({
      message: "Notification updated successfully",
      notification: updated,
    });
  }
);

export const deleteNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const deleted = await Notification.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Notification not found" });
    }

    return res.status(200).json({
      message: "Notification deleted successfully",
    });
  }
);
