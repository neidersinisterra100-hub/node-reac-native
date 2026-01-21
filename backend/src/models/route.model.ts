import mongoose from "mongoose";

const routeSchema = new mongoose.Schema(
  {
    origin: {
      type: String,
      required: true,
      trim: true
    },
    destination: {
      type: String,
      required: true,
      trim: true
    },

    // 🔥 CLAVE PARA LA CASCADA
    companyId: {
      type: mongoose.Schema.Types.ObjectId, // ✅ CORRECTO
      ref: "Company",
      required: true,
      index: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // 🔥 CONSISTENCIA DE ESTADO
    isActive: {
      type: Boolean,
      default: true
    },

    deactivatedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export interface RouteDocument extends mongoose.Document {
  origin: string;
  destination: string;
  companyId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  deactivatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 🔎 ÍNDICE COMPUESTO (RECOMENDADO)
routeSchema.index({ companyId: 1, isActive: 1 });

export const RouteModel =
  mongoose.models.Route ||
  mongoose.model("Route", routeSchema);



// import mongoose from 'mongoose';

// const routeSchema = new mongoose.Schema(
//   {
//     origin: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     destination: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     company: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Company',
//       required: true,
//     },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     active: {
//       type: Boolean,
//       default: true, // 🔧 CAMBIO CLAVE
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// export const RouteModel = mongoose.model('Route', routeSchema);
