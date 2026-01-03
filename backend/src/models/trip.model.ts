import { Schema, model, Types } from "mongoose";

const TripSchema = new Schema(
  {
    route: {
      type: Types.ObjectId,
      ref: "Route",
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
    },
  },
  { timestamps: true }
);

export const TripModel = model("Trip", TripSchema);
