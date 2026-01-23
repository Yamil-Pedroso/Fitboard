import { Schema, model, HydratedDocument, Model, Types } from "mongoose";
import bcrypt from "bcryptjs";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  emailLower: string;
  username: string;
  passwordHash: string;
  avatar?: string;
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
      select: false, // never return by default
      validate: {
        validator: (v: string) => bcryptHashRe.test(v),
        message: "Invalid password hash format (expected bcrypt).",
      },
    },
    resetTokenHash: { type: String, default: null, select: false },
    resetTokenExpiry: { type: Date, default: null, select: false },
    isAdmin: { type: Boolean, default: false },
    active: { type: Boolean, default: false },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/ddgf7ijdc/image/upload/v1709338082/userAvatart/Avatars/ez5hjkxgtf0mcnjytx0c.jpg",
    },
  },
  { timestamps: true },
);

/* Normalize and keep emailLower in sync */
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
  const payload = { sub: this._id.toString(), isAdmin: this.isAdmin } as const;
  return jwt.sign(payload, secret, options);
};

/* Strip sensitive fields on JSON */
UserSchema.methods.toSafeJSON = function (this: UserDoc) {
  const { passwordHash, __v, ...rest } = this.toObject({ getters: true });
  return rest as Omit<IUser, "passwordHash">;
};

export const User = model<IUser, UserModel>("User", UserSchema);
