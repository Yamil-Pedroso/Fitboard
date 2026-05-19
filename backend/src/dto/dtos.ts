import { z } from "zod";

export const SetAdminDto = z.object({ isAdmin: z.boolean() });

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

export const UpdateUserDto = z.object({
  username: z.string().min(3).max(32).optional(),
  avatar: z.string().url().optional(),
  active: z.boolean().optional(),
});
export type UpdateUserInput = z.infer<typeof UpdateUserDto>;

export const ForgotPasswordDto = z.object({
  email: z.email(),
});

export const ResetPasswordDto = z.object({
  token: z.string().min(1),
  email: z.email(),
  newPassword: z.string().min(8),
});

export const RegisterDto = z.object({
  email: z.email(),
  username: z.string().min(3).max(32),
  password: z.string().min(8),
  avatar: z.url().optional(),
});

export const LoginDto = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const UpdateMeDto = z.object({
  username: z.string().min(3).max(32).optional(),
  avatar: z.url().optional(),
  active: z.boolean().optional(),

  preferences: z
    .object({
      language: z.enum(["en", "de", "es"]).optional(),
      theme: z.enum(["system", "light", "dark"]).optional(),
      unitSystem: z.enum(["metric", "imperial"]).optional(),
    })
    .optional(),

  macroGoals: z
    .object({
      kcal: z.number().min(0).optional(),
      protein: z.number().min(0).optional(),
      carbs: z.number().min(0).optional(),
      fats: z.number().min(0).optional(),
    })
    .optional(),

  notifications: z
    .object({
      meals: z.boolean().optional(),
      weekly: z.boolean().optional(),
      product: z.boolean().optional(),
    })
    .optional(),
});

export const ChangePasswordDto = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});
