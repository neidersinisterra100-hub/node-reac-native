import mongoose, { Schema, model, Document, Types } from "mongoose";

export type UserRole = "user" | "owner" | "admin" | "super_owner" | "driver";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  verified: boolean;
  departmentId?: Types.ObjectId | null;

  // 🔥 CLAVE PARA JWT / OWNERSHIP
  companyId?: Types.ObjectId | null;

  // Relación jerárquica (opcional)
  ownerId?: Types.ObjectId | null;

  // For futuro multi-empresa
  managedCompanies?: Types.ObjectId[];

  // 📝 PROFILE COMPLETION
  identificationNumber?: string; // Encrypted
  phone?: string;
  birthDate?: Date;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  isProfileComplete: boolean;

  // 🔐 SECURITY: Brute force protection
  failedLoginAttempts?: number;
  lockUntil?: Date | null;
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
      enum: ["user", "owner", "admin", "super_owner", "driver"],
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

    verified: {
      type: Boolean,
      default: false,
    },


    managedCompanies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Company",
      },
    ],

    // 📝 PROFILE COMPLETION
    identificationNumber: { type: String, default: null, index: true },
    phone: { type: String, default: null },
    birthDate: { type: Date, default: null },
    address: { type: String, default: null },
    emergencyContactName: { type: String, default: null },
    emergencyContactPhone: { type: String, default: null },
    isProfileComplete: { type: Boolean, default: false },

    // 🔐 SECURITY: Brute force protection
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const UserModel =
  mongoose.models.User || model<IUser>("User", UserSchema);
