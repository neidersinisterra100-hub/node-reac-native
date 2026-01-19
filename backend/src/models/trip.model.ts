import { Schema, model, Types } from "mongoose";

const tripSchema = new Schema(
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
      index: true, // 🔐 CLAVE: todas las queries filtran por company
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
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
    transportType: {
      type: String,
      default: "lancha", // 🔧 normalizado
      enum: ["lancha", "metrera", "barco"],
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================================================
   ÍNDICES COMPUESTOS (RENDIMIENTO + SEGURIDAD)
   ========================================================= */

// Para listados por empresa
tripSchema.index({ company: 1, createdAt: -1 });

// Para listados por fecha
tripSchema.index({ company: 1, date: 1 });

// 🔒 FUTURO (OPCIONAL):
// Evitar viajes duplicados en misma ruta / fecha / hora
// tripSchema.index(
//   { company: 1, route: 1, date: 1, departureTime: 1 },
//   { unique: true }
// );

export const TripModel = model("Trip", tripSchema);
