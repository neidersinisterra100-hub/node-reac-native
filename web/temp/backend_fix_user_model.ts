import { Schema, model, models, Document, Types } from "mongoose";

export type UserRole = "user" | "owner" | "admin";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;

  /**
   * Empresa asociada (legacy/contexto principal)
   */
  company?: Types.ObjectId | null;

  /**
   * Referencia al Owner que creó a este Admin.
   * Se usa principalmente cuando role === 'admin'.
   */
  ownerId?: Types.ObjectId | null;

  /**
   * Lista de empresas que este Admin tiene permiso de gestionar.
   * Se usa cuando role === 'admin'.
   */
  managedCompanies?: Types.ObjectId[];
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

    // --- Nuevos campos para la gestión de Admins ---
    
    // El ID del Owner jefe de este admin
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Array de IDs de las empresas que puede administrar
    managedCompanies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Company",
      },
    ],
  },
  { timestamps: true }
);

// 🔥 CORRECCIÓN AQUÍ: Usar models.User || model(...) para evitar OverwriteModelError
export const UserModel = models.User || model<IUser>("User", UserSchema);
