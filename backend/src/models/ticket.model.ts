import { Schema, model, Types } from "mongoose";

const TicketSchema = new Schema(
  {
    /* =====================================================
       RELACIONES
       ===================================================== */
    trip: {
      type: Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },

    company: {
      type: Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    // usuario que compró o registró el ticket
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* =====================================================
       DATOS DEL VIAJE (SNAPSHOT)
       ===================================================== */
    routeName: {
      type: String,
      required: true,
    },

    // fecha y hora REAL del viaje
    departureAt: {
      type: Date,
      required: true,
      index: true,
    },

    /* =====================================================
       ASIENTO
       ===================================================== */
    // número de asiento asignado (1, 2, 3, ...)
    seatNumber: {
      type: Number,
      default: null,
    },

    /* =====================================================
       PAGO / TRANSPORTE
       ===================================================== */
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    transport: {
      type: String,
      enum: ["lancha", "barco", "metrera", "bus"],
      default: "lancha",
    },

    /* =====================================================
       ESTADO DEL TICKET
       ===================================================== */
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["valid", "used", "expired", "cancelled"],
      default: "valid",
      index: true,
    },

    usedAt: {
      type: Date,
      default: null,
    },

    // fecha límite para usar el ticket
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* =====================================================
   ÍNDICES DE SEGURIDAD
   ===================================================== */

// 🔒 un usuario no puede comprar dos veces el mismo viaje
TicketSchema.index({ user: 1, trip: 1 }, { unique: true });

// 🔒 un asiento no puede repetirse dentro del mismo viaje
TicketSchema.index(
  { trip: 1, seatNumber: 1 },
  {
    unique: true,
    partialFilterExpression: {
      seatNumber: { $ne: null },
    },
  }
);

export const TicketModel = model("Ticket", TicketSchema);
