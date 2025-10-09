import { Schema, model, Types, HydratedDocument } from "mongoose";
import { z } from "zod";

export type CategoryKind = "recipe" | "routine";

export interface ICategory {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  kind: CategoryKind;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CategoryDoc = HydratedDocument<ICategory>;

const CategorySchema = new Schema<ICategory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    kind: { type: String, enum: ["recipe", "routine"], required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

CategorySchema.index({ userId: 1, kind: 1, name: 1 }, { unique: true });

export const Category = model<ICategory>("Category", CategorySchema);

/* DTOs */
export const CreateCategoryDto = z.object({
  kind: z.enum(["recipe", "routine"]),
  name: z.string().min(2),
});

export const UpdateCategoryDto = z.object({
  name: z.string().min(2).optional(),
});
