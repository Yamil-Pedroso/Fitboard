import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { z, ZodError } from "zod";
import { v2 as cloudinary } from "cloudinary";
import { User } from "../models/User";
import { uploadBufferToCloudinary } from "../utils/cloudinary-upload";
import {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  UpdateMeDto,
  UpdateUserDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "../dto/dtos";
import { generateResetToken } from "../utils/reset-token";
import { sendResetEmailDev } from "../utils/mailer-dev";
import crypto from "crypto";

export type AuthRequest = Request & { auth?: { userId: string } };

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = RegisterDto.parse(req.body);

  let avatarUrl =
    data.avatar ??
    "https://res.cloudinary.com/ddgf7ijdc/image/upload/v1733781971/userAvatart/Avatars/yf13f4uoy32msk195epl.jpg";
  let avatarPublicId: string | undefined = undefined;

  if ((req as any).file?.buffer) {
    const upload = await uploadBufferToCloudinary((req as any).file.buffer, {
      folder: "userAvatars/Avatars",
      resource_type: "image",
    });
    avatarUrl = upload.secure_url;
    avatarPublicId = upload.public_id;
  }

  const user = new User({
    email: data.email,
    username: data.username,
    password: data.password,
    avatarUrl,
    active: true,
  });

  await user.setPassword(data.password);
  await user.save();

  return res.status(201).json(user.toSafeJSON());
});

export const getUsers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const caller = await User.findById(req.auth.userId).lean();
    if (!caller?.isAdmin) return res.status(403).json({ error: "Forbidden" });

    const page = Math.max(parseInt(String(req.query.page ?? "1"), 10), 1);
    const limit = Math.min(
      Math.max(parseInt(String(req.query.limit ?? "20"), 10), 1),
      100,
    );
    const skip = (page - 1) * limit;

    const q = String(req.query.q ?? "").trim();
    const activeParam = req.query.active;
    const active =
      typeof activeParam === "string" ? activeParam === "true" : undefined;

    const filter: any = {};
    if (q) {
      filter.$or = [
        { emailLower: { $regex: q.toLowerCase(), $options: "i" } },
        { username: { $regex: q, $options: "i" } },
      ];
    }
    if (active !== undefined) filter.active = active;

    const sort = String(req.query.sort ?? "-createdAt");

    const [items, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    const users = items.map((u) => ({
      _id: u._id,
      email: u.email,
      username: u.username,
      avatar: u.avatar,
      isAdmin: u.isAdmin,
      active: u.active,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    res.json({ page, limit, total, users });
  },
);

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = LoginDto.parse(req.body);
  const user = await User.findOne({
    emailLower: email.toLowerCase().trim(),
  }).select("+passwordHash");
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await user.isValidPassword(password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = user.getSignedJwtToken();
  res.json({ token, user: user.toSafeJSON() });
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });

  const user = await User.findById(req.auth.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json(user.toSafeJSON());
});

export const updateMe = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const patch = UpdateMeDto.parse(req.body);
    const user = await User.findByIdAndUpdate(
      req.auth.userId,
      { $set: patch },
      { new: true },
    );
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user.toSafeJSON());
  },
);

export const changePassword = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const data = ChangePasswordDto.parse(req.body);
    const user = await User.findById(req.auth.userId).select("+passwordHash");
    if (!user) return res.status(404).json({ error: "User not found" });

    const ok = await user.isValidPassword(data.currentPassword);
    if (!ok) return res.status(401).json({ error: "Invalid current password" });

    await user.setPassword(data.newPassword);
    await user.save();

    res.json({ ok: true });
  },
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie("auth_token", { path: "/", sameSite: "none", secure: true });

  (req as any).session = null;

  res.json({ ok: true });
});

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = ForgotPasswordDto.parse(req.body);
    const emailLower = email.toLowerCase().trim();

    const user = await User.findOne({ emailLower });
    if (user) {
      const { token, hash } = generateResetToken();
      user.set({
        resetTokenHash: hash,
        resetTokenExpiry: new Date(Date.now() + 1000 * 60 * 30),
      }); // 30 min
      await user.save();

      const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
      const link = `${frontendUrl}/auth/reset-password?token=${encodeURIComponent(
        token,
      )}&email=${encodeURIComponent(emailLower)}`;

      if (process.env.NODE_ENV !== "production") {
        const preview = await sendResetEmailDev(emailLower, link);
        return res.json({ ok: true, preview, resetLink: link });
      }

      console.log(`[RESET LINK] ${link}`);
    }

    return res.json({ ok: true });
  },
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, email, newPassword } = ResetPasswordDto.parse(req.body);
    const emailLower = email.toLowerCase().trim();

    const hash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      emailLower,
      resetTokenHash: hash,
      resetTokenExpiry: { $gt: new Date() },
    }).select("+passwordHash");

    if (!user)
      return res.status(400).json({ error: "Invalid or expired token" });

    await user.setPassword(newPassword);
    user.set({ resetTokenHash: null, resetTokenExpiry: null });
    await user.save();

    return res.json({ ok: true });
  },
);
