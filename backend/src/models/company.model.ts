import { Schema, model, Types } from 'mongoose';

const CompanySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    owner: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    balance: {
      type: Number,
      default: 0,
      min: 0,
    },

    active: {
      type: Boolean,
      default: true,
    },

    transportTypes: {
      type: [String],
      default: ['lancha'], // lancha | barco | metrera | bus | etc
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual para obtener las rutas de la empresa
CompanySchema.virtual('routes', {
  ref: 'Route',
  localField: '_id',
  foreignField: 'company',
});

// Virtual para obtener los viajes de la empresa
CompanySchema.virtual('trips', {
  ref: 'Trip',
  localField: '_id',
  foreignField: 'company',
});

export const CompanyModel = model('Company', CompanySchema);
