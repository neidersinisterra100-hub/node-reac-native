import { Schema, model } from "mongoose";
import { TRANSPORT_TYPES } from "../constants/enums.js";

const tripSchema = new Schema(
  {
    // 🔥 CLAVE PARA LA CASCADA
    routeId: {
      type: Schema.Types.ObjectId, // ✅ CORRECTO
      ref: "Route",
      required: true,
      index: true
    },

    // 🔥 DENORMALIZACIÓN FULL
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true
    },
    municipioId: {
      type: Schema.Types.ObjectId,
      ref: "Municipio",
      required: true,
      index: true
    },

    cityId: {
      type: Schema.Types.ObjectId,
      ref: "City",
      required: true,
      index: true
    },

    // 🔥 CLAVE PARA BLOQUEO POR EMPRESA
    companyId: {
      type: Schema.Types.ObjectId, // ✅ CORRECTO
      ref: "Company",
      required: true,
      index: true
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true
    },

    departureTime: {
      type: String, // HH:mm
      required: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    transportType: {
      type: String,
      default: "lancha",
      enum: TRANSPORT_TYPES,
      set: (v: string) => v?.toLowerCase()
    },

    capacity: {
      type: Number,
      required: true,
      min: 1
    },

    // 🔥 CONSISTENCIA DE ESTADO
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    deactivatedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

/* =========================================================
   ÍNDICES COMPUESTOS
   ========================================================= */

// Listados por empresa
tripSchema.index({ companyId: 1, createdAt: -1 });

// Listados por fecha
tripSchema.index({ companyId: 1, date: 1 });

// 🔒 FUTURO (OPCIONAL)
// tripSchema.index(
//   { companyId: 1, routeId: 1, date: 1, departureTime: 1 },
//   { unique: true }
// );

export const TripModel =
  model("Trip", tripSchema);
