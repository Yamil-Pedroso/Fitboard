import { Schema, model, HydratedDocument, Model, Types } from "mongoose";
import bcrypt from "bcryptjs";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

export type SubscriptionPlan = "free" | "pro" | "elite";

export type SubscriptionStatus =
  | "active"
  | "inactive"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete";

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  emailLower: string;
  username: string;
  passwordHash: string;
  avatar?: string;

  preferences: {
    language: "en" | "de" | "es";
    theme: "system" | "light" | "dark";
    unitSystem: "metric" | "imperial";
  };

  macroGoals: {
    kcal: number;
    protein: number;
    carbs: number;
    fats: number;
  };

  notifications: {
    meals: boolean;
    weekly: boolean;
    product: boolean;
  };

  subscription: {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
    currentPeriodEnd?: Date | null;
  };

  isAdmin: boolean;
  active: boolean;
  resetTokenHash?: string | null;
  resetTokenExpiry?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  setPassword(plain: string): Promise<void>;
  isValidPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  toSafeJSON(): Omit<IUser, "passwordHash">;
}

export type UserDoc = HydratedDocument<IUser, IUserMethods>;
export type UserModel = Model<IUser, {}, IUserMethods>;

const bcryptHashRe = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

const UserSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: { type: String, required: true, trim: true },
    emailLower: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, trim: true },

    passwordHash: {
      type: String,
      required: true,
      select: false,
      validate: {
        validator: (v: string) => bcryptHashRe.test(v),
        message: "Invalid password hash format (expected bcrypt).",
      },
    },

    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/ddgf7ijdc/image/upload/v1709338082/userAvatart/Avatars/ez5hjkxgtf0mcnjytx0c.jpg",
    },

    preferences: {
      language: {
        type: String,
        enum: ["en", "de", "es"],
        default: "en",
      },
      theme: {
        type: String,
        enum: ["system", "light", "dark"],
        default: "system",
      },
      unitSystem: {
        type: String,
        enum: ["metric", "imperial"],
        default: "metric",
      },
    },

    macroGoals: {
      kcal: {
        type: Number,
        default: 2200,
      },
      protein: {
        type: Number,
        default: 160,
      },
      carbs: {
        type: Number,
        default: 220,
      },
      fats: {
        type: Number,
        default: 70,
      },
    },

    notifications: {
      meals: {
        type: Boolean,
        default: true,
      },
      weekly: {
        type: Boolean,
        default: true,
      },
      product: {
        type: Boolean,
        default: false,
      },
    },

    subscription: {
      plan: {
        type: String,
        enum: ["free", "pro", "elite"],
        default: "free",
      },
      status: {
        type: String,
        enum: [
          "active",
          "inactive",
          "trialing",
          "past_due",
          "canceled",
          "incomplete",
        ],
        default: "active",
      },
      stripeCustomerId: {
        type: String,
        default: null,
        index: true,
      },
      stripeSubscriptionId: {
        type: String,
        default: null,
        index: true,
      },
      currentPeriodEnd: {
        type: Date,
        default: null,
      },
    },

    resetTokenHash: { type: String, default: null, select: false },
    resetTokenExpiry: { type: Date, default: null, select: false },

    isAdmin: { type: Boolean, default: false },
    active: { type: Boolean, default: false },
  },
  { timestamps: true },
);

UserSchema.pre("validate", function (next) {
  if (this.email) this.emailLower = this.email.toLowerCase().trim();
  next();
});

UserSchema.methods.setPassword = async function (this: UserDoc, plain: string) {
  this.passwordHash = await bcrypt.hash(plain, 12);
};

UserSchema.methods.isValidPassword = function (this: UserDoc, entered: string) {
  return bcrypt.compare(entered, this.passwordHash);
};

UserSchema.methods.getSignedJwtToken = function (this: UserDoc): string {
  const secret: Secret = process.env.JWT_SECRET ?? "dev_secret_change_me";

  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRE ?? "7d") as SignOptions["expiresIn"],
    algorithm: "HS256",
  };

  const payload = {
    sub: this._id.toString(),
    isAdmin: this.isAdmin,
  } as const;

  return jwt.sign(payload, secret, options);
};

UserSchema.methods.toSafeJSON = function (this: UserDoc) {
  const { passwordHash, __v, ...rest } = this.toObject({ getters: true });
  return rest as Omit<IUser, "passwordHash">;
};

export const User = model<IUser, UserModel>("User", UserSchema);
