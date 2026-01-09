import { Schema, model, Document, Types } from "mongoose";

export type UserRole = "user" | "owner" | "admin";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;

  /**
   * Empresa asociada (solo owner / admin)
   */
  company?: Types.ObjectId | null;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "owner", "admin"],
      default: "user",
    },

    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
  },
  { timestamps: true }
);

export const UserModel = model<IUser>("User", UserSchema);
