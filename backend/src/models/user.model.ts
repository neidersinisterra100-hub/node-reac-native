import mongoose, { Schema, model, Document, Types } from "mongoose";

export type UserRole = "user" | "owner" | "admin" | "super_owner";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;

  departmentId?: Types.ObjectId | null;

  // 🔥 CLAVE PARA JWT / OWNERSHIP
  companyId?: Types.ObjectId | null;

  // Relación jerárquica (opcional)
  ownerId?: Types.ObjectId | null;

  // Para futuro multi-empresa
  managedCompanies?: Types.ObjectId[];
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["user", "owner", "admin", "super_owner"],
      default: "user",
    },

    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      default: null,
      index: true,
    },

    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      default: null,
      index: true,
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    managedCompanies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Company",
      },
    ],
  },
  { timestamps: true }
);

export const UserModel =
  mongoose.models.User || model<IUser>("User", UserSchema);
