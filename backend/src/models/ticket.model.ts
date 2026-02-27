import mongoose, { Schema, model, Types, Document, Model } from "mongoose";

/* =========================================================
   TICKET DOCUMENT (TIPO TYPESCRIPT)
   ========================================================= */

/**
 * TicketDocument
 *
 * Representa un Ticket REAL dentro del backend.
 *
 * ⚠️ IMPORTANTE:
 * - Este tipo lo usa TypeScript
 * - NO es lo mismo que el Schema
 * - Aquí definimos qué campos EXISTEN siempre
 */
export interface TicketDocument extends Document {
  /* =========================
     RELACIONES
     ========================= */
  departmentId: Types.ObjectId;
  municipioId: Types.ObjectId;
  cityId: Types.ObjectId;
  trip: Types.ObjectId;
  passenger: Types.ObjectId;

  /* =========================
     DATOS DEL PASAJERO
     ========================= */
  passengerName: string;
  passengerId: string;
  seatNumber?: string;

  /* =========================
     ESTADO DEL TICKET
     ========================= */
  status: "active" | "used" | "cancelled" | "expired" | "pending_payment" | "reserved";

  qrCode?: string;
  purchaseDate: Date;

  /* =========================
     FINANZAS
     ========================= */
  financials: {
    price: number;
    platformFee: number;
    companyNet: number;
    gatewayFeeEstimated: number;
  };

  /* =========================
     PAGO (NO OPCIONAL)
     ========================= */
  /**
   * ⚠️ payment NO es opcional
   * Todo ticket SIEMPRE tiene información de pago
   * (incluso CASH)
   */
  payment: {
    status: "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";
    reference?: string;
    transactionId?: string;
    paymentMethod?: "WOMPI" | "CASH";
    paidAt?: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}

/* =========================================================
   TICKET SCHEMA (MONGOOSE)
   ========================================================= */

/**
 * ⚠️ REGLA DE ORO:
 * - Interface → Types.ObjectId
 * - Schema    → Schema.Types.ObjectId
 */
const TicketSchema = new Schema<TicketDocument>(
  {
    /* =========================
       RELACIONES
       ========================= */

    /* =========================
       RELACIONES
       ========================= */

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

    trip: {
      type: Schema.Types.ObjectId, // ✅ CORRECTO
      ref: "Trip",
      required: true,
      index: true,
    },

    passenger: {
      type: Schema.Types.ObjectId, // ✅ CORRECTO
      ref: "User",
      required: true,
    },

    /* =========================
       DATOS DEL PASAJERO
       ========================= */

    passengerName: {
      type: String,
      required: true,
      index: "text", // búsqueda rápida
    },

    passengerId: {
      type: String,
      required: true,
      index: true,
    },

    seatNumber: {
      type: String,
    },

    /* =========================
       ESTADO DEL TICKET
       ========================= */

    status: {
      type: String,
      enum: ["active", "used", "cancelled", "expired", "pending_payment", "reserved"],
      default: "pending_payment", // ⚠️ CORRECCIÓN IMPORTANTE
      index: true,
    },

    qrCode: {
      type: String,
      index: true,
    },

    purchaseDate: {
      type: Date,
      default: Date.now,
      index: true,
    },

    /* =========================
       FINANZAS
       ========================= */

    financials: {
      price: { type: Number, required: true },
      platformFee: { type: Number, default: 0 },
      companyNet: { type: Number, default: 0 },
      gatewayFeeEstimated: { type: Number, default: 0 },
    },

    /* =========================
       PAGO (SIEMPRE EXISTE)
       ========================= */

    payment: {
      status: {
        type: String,
        enum: ["PENDING", "APPROVED", "DECLINED", "VOIDED", "ERROR"],
        required: true,
        default: "PENDING",
      },
      reference: { type: String },
      transactionId: { type: String },
      paymentMethod: {
        type: String,
        enum: ["WOMPI", "CASH"],
      },
      paidAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

/* =========================================================
   EXPORTACIÓN DEL MODELO (TIPADO CLAVE)
   ========================================================= */

/**
 * ⚠️ ESTA LÍNEA ES CRÍTICA
 *
 * Si no tipas el Model<TicketDocument>,
 * TypeScript volverá a pensar que payment es opcional.
 */
export const TicketModel: Model<TicketDocument> =
  mongoose.models.Ticket ||
  model<TicketDocument>("Ticket", TicketSchema);



// import { Schema, model, Types } from 'mongoose';

// const TicketSchema = new Schema(
//   {
//     trip: {
//       type: Types.ObjectId,
//       ref: 'Trip',
//       required: true,
//       index: true,
//     },

//     passenger: {
//       type: Types.ObjectId,
//       ref: 'User',
//       required: true, // El usuario que compra
//     },

//     // Datos del pasajero real
//     passengerName: {
//       type: String,
//       required: true,
//       index: "text" // 👈 Índice para búsqueda rápida
//     },
//     passengerId: {
//       type: String,
//       required: true,
//       index: true // 👈 Índice para búsqueda exacta
//     },

//     seatNumber: {
//       type: String,
//     },

//     status: {
//       type: String,
//       enum: ['active', 'used', 'cancelled', 'expired', 'pending_payment', 'reserved'],
//       default: 'active',
//       index: true
//     },

//     qrCode: {
//       type: String,
//       index: true // 👈 Índice para validación rápida
//     },

//     purchaseDate: {
//       type: Date,
//       default: Date.now,
//       index: true // 👈 Índice para reportes por fecha
//     },

//     /* =========================================
//        DATOS FINANCIEROS Y DE PAGO
//        ========================================= */
//     financials: {
//       price: { type: Number, required: true },
//       platformFee: { type: Number, default: 0 },
//       companyNet: { type: Number, default: 0 },
//       gatewayFeeEstimated: { type: Number, default: 0 },
//     },

//     payment: {
//       status: {
//         type: String,
//         enum: ["PENDING", "APPROVED", "DECLINED", "VOIDED", "ERROR"],
//         required: true,
//         default: "PENDING",
//       },
//       reference: { type: String },
//       transactionId: { type: String },
//       paymentMethod: {
//         type: String,
//         enum: ["WOMPI", "CASH"],
//       },
//       paidAt: { type: Date },
//     },

//   },
//   {
//     timestamps: true,
//   }
// );

// export const TicketModel = model('Ticket', TicketSchema);
