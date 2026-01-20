import { z } from "zod";

// Admin dto: isAdmin can only be set in admin-only routes
export const SetAdminDto = z.object({ isAdmin: z.boolean() });

// User creation dto
export const CreateUserDto = z.object({
  email: z.email(),
  username: z.string().min(3).max(32),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Must include an uppercase letter" })
    .regex(/[a-z]/, { message: "Must include a lowercase letter" })
    .regex(/[0-9]/, { message: "Must include a number" }),
  avatar: z.url().optional(),
});
export type CreateUserInput = z.infer<typeof CreateUserDto>;

/* Update DTO: do not accept isAdmin here (handle it in admin-only routes) */
export const UpdateUserDto = z.object({
  username: z.string().min(3).max(32).optional(),
  avatar: z.string().url().optional(),
  active: z.boolean().optional(),
});
export type UpdateUserInput = z.infer<typeof UpdateUserDto>;

// Password DTOs
export const ForgotPasswordDto = z.object({
  email: z.email(),
});

export const ResetPasswordDto = z.object({
  token: z.string().min(1),
  email: z.email(),
  newPassword: z.string().min(8),
});

// Register DTO
export const RegisterDto = z.object({
  email: z.email(),
  username: z.string().min(3).max(32),
  password: z.string().min(8),
  avatar: z.url().optional(),
});

// Login DTO
export const LoginDto = z.object({
  email: z.email(),
  password: z.string().min(1),
});

// Update self DTO
export const UpdateMeDto = z.object({
  username: z.string().min(3).max(32).optional(),
  avatar: z.url().optional(),
  active: z.boolean().optional(),
});

// Change password DTO
export const ChangePasswordDto = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});
