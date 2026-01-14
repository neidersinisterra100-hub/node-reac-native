import mongoose, { Schema, Document } from "mongoose";

/* ================= USER MODEL UPDATE ================= */
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "user" | "owner" | "admin";
  ownerId?: mongoose.Types.ObjectId; // Referencia al Jefe (si es admin)
  managedCompanies: mongoose.Types.ObjectId[]; // Empresas que puede administrar
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ["user", "owner", "admin"], 
      default: "user" 
    },
    // NUEVOS CAMPOS
    ownerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    managedCompanies: [{ type: Schema.Types.ObjectId, ref: "Company" }]
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>("User", UserSchema);


/* ================= COMPANY MODEL UPDATE ================= */
export interface ICompany extends Document {
  // ... campos existentes ...
  name: string;
  owner: mongoose.Types.ObjectId;
  admins: mongoose.Types.ObjectId[]; // Lista de admins asignados
  active: boolean;
  // ...
}

const CompanySchema = new Schema(
  {
    name: { type: String, required: true },
    // ... otros campos existentes (nit, legal, etc) ...
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    active: { type: Boolean, default: true },
    
    // NUEVO CAMPO
    admins: [{ type: Schema.Types.ObjectId, ref: "User" }], 
    
    // ... compliance, balance, etc ...
  },
  { timestamps: true }
);

export const CompanyModel = mongoose.model<ICompany>("Company", CompanySchema);


/* ================= SCHEDULE MODEL (NUEVO) ================= */
export interface ISchedule extends Document {
  date: Date; // Fecha del turno (sin hora)
  company: mongoose.Types.ObjectId;
  admin: mongoose.Types.ObjectId;
  active: boolean; // Si está activo ese día
  owner: mongoose.Types.ObjectId; // Para facilitar consultas del dueño
}

const ScheduleSchema = new Schema({
  date: { type: Date, required: true },
  company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  admin: { type: Schema.Types.ObjectId, ref: "User", required: true },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

// Índice compuesto para evitar duplicados (mismo admin, misma empresa, misma fecha)
ScheduleSchema.index({ date: 1, company: 1, admin: 1 }, { unique: true });

export const ScheduleModel = mongoose.model<ISchedule>("Schedule", ScheduleSchema);
