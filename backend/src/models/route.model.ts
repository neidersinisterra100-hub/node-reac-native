import { Schema, model } from "mongoose";

const RouteSchema = new Schema(
  {
    origin: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Evita rutas duplicadas
RouteSchema.index({ origin: 1, destination: 1 }, { unique: true });

export const RouteModel = model("Route", RouteSchema);
