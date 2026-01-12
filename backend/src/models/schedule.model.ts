import mongoose, { Schema, model, Types, Document } from 'mongoose';

export interface ISchedule extends Document {
  date: Date;
  company: Types.ObjectId;
  admin: Types.ObjectId;
  owner: Types.ObjectId;
  active: boolean;
}

const ScheduleSchema = new Schema<ISchedule>(
  {
    date: { type: Date, required: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    admin: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

ScheduleSchema.index({ date: 1, company: 1, admin: 1 }, { unique: true });

// CORRECCIÓN: Usar mongoose.models
export const ScheduleModel = mongoose.models.Schedule || model<ISchedule>('Schedule', ScheduleSchema);


// import { Schema, model, Types, Document, models } from 'mongoose';

// export interface ISchedule extends Document {
//   date: Date;
//   company: Types.ObjectId;
//   admin: Types.ObjectId;
//   owner: Types.ObjectId;
//   active: boolean;
// }

// const ScheduleSchema = new Schema<ISchedule>(
//   {
//     date: {
//       type: Date,
//       required: true,
//     },
//     company: {
//       type: Schema.Types.ObjectId,
//       ref: 'Company',
//       required: true,
//     },
//     admin: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     owner: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     active: {
//       type: Boolean,
//       default: true,
//     }
//   },
//   { timestamps: true }
// );

// // Índice único compuesto: Un admin solo puede tener un turno por empresa en una fecha específica
// ScheduleSchema.index({ date: 1, company: 1, admin: 1 }, { unique: true });

// // ... (código anterior)
// export const ScheduleModel = models.Schedule || model<ISchedule>('Schedule', ScheduleSchema);
// // export const ScheduleModel = model<ISchedule>('Schedule', ScheduleSchema);