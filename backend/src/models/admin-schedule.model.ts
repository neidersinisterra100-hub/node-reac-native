import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAdminSchedule extends Document {
  companyId: Types.ObjectId;
  adminId: Types.ObjectId;
  day: number;
  month: number;
  year: number;
  type: 'work' | 'rest' | 'vacation' | 'sick';
  note?: string;
  // Campos para automatización n8n
  scheduledStart: Date; // Fecha exacta de inicio (ej: YYYY-MM-DDT06:00:00)
  scheduledEnd?: Date;  // Fecha exacta de fin (opcional)
  isActive: boolean;    // Estado actual del turno (admin trabajando)
  isSalesActive: boolean; // Estado de ventas (tickets disponibles para usuarios)
  updatedAt: Date;
}

const adminScheduleSchema = new Schema<IAdminSchedule>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    day: { type: Number, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    type: {
      type: String,
      enum: ['work', 'rest', 'vacation', 'sick'],
      required: true,
    },
    note: { type: String },
    // Nuevos campos
    scheduledStart: { type: Date, required: true }, // Indexado para n8n
    scheduledEnd: { type: Date },
    isActive: { type: Boolean, default: false },
    isSalesActive: { type: Boolean, default: false }, // Por defecto ventas cerradas
  },
  {
    timestamps: true,
  }
);

// Índice compuesto único para evitar duplicados por admin/día
adminScheduleSchema.index(
  { companyId: 1, adminId: 1, day: 1, month: 1, year: 1 },
  { unique: true }
);

// Índice para que n8n encuentre rápidamente qué activar
adminScheduleSchema.index({ scheduledStart: 1, isActive: 1, isSalesActive: 1 });

export const AdminScheduleModel = mongoose.model<IAdminSchedule>(
  'AdminSchedule',
  adminScheduleSchema
);
