import { Schema, model } from "mongoose";

export enum UserRole {
  OWNER = "owner",
  USER = "user",
  ADMIN = "admin",
}

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
  },
  { timestamps: true }
);

export default model("User", UserSchema);
