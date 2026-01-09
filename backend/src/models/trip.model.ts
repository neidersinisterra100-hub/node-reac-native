import { Schema, model, Types } from 'mongoose';

const tripSchema = new Schema(
  {
    route: {
      type: Types.ObjectId,
      ref: 'Route',
      required: true,
    },
    company: {
      type: Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    departureTime: {
      type: String, // HH:mm
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    transportType: {
      type: String,
      default: 'Lancha',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const TripModel = model('Trip', tripSchema);
