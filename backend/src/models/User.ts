import { Schema, model } from "mongoose";

/* =========================================================
   ROLES DE USUARIO
   ========================================================= */
export enum UserRole {
  OWNER = "owner",
  USER = "user",
  ADMIN = "admin",
}

/* =========================================================
   ESQUEMA DE USUARIO
   ========================================================= */
const UserSchema = new Schema(
  {
    /* =========================
       DATOS BÁSICOS
       ========================= */
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
      trim: true, // 🧹 evita espacios invisibles
    },

    password: {
      type: String,
      required: true,
    },

    /* =========================
       AUTORIZACIÓN
       ========================= */
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },

    /* =========================
       VERIFICACIÓN DE EMAIL
       ========================= */
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

/* =========================================================
   EXPORT
   ========================================================= */
export default model("User", UserSchema);
