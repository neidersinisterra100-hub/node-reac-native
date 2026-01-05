import { Schema, model, Types } from "mongoose";

const TripSchema = new Schema(
  {
    route: {
      type: Types.ObjectId,
      ref: "Route",
      required: true,
      index: true,
    },

    company: {
      type: Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
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
      min: 0,
    },

    capacity: {
      type: Number,
      default: 20,
      min: 1,
    },

    transportType: {
      type: String,
      default: "lancha", // lancha | barco | metrera | bus
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const TripModel = model("Trip", TripSchema);
