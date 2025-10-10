import { z } from "zod";

export const ListAllQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().optional(),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  slot: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
  sort: z.enum(["date", "-date", "createdAt", "-createdAt"]).default("-date"),
});
