import mongoose, {
  Schema,
  model,
  Types,
  Document,
} from "mongoose";

/* =========================================================
   COMPANY DOCUMENT (TIPO TYPESCRIPT)
   ========================================================= */

export interface CompanyDocument extends Document {
  name: string;

  // Relaciones
  departmentId: Types.ObjectId; // New ref
  municipioId: Types.ObjectId;
  cityId: Types.ObjectId;
  owner: Types.ObjectId;
  admins: Types.ObjectId[];

  // Estado financiero
  balance: number;

  // 🔥 ESTADO CANÓNICO
  isActive: boolean;
  deactivatedAt?: Date;

  transportTypes: string[];

  // Plan y suscripción
  plan: "free" | "pro" | "enterprise";
  subscriptionStatus: "active" | "inactive" | "past_due" | "cancelled";

  // Datos legales
  nit: string;
  legalRepresentative: string;

  compliance: {
    hasLegalConstitution: boolean;
    hasTransportLicense: boolean;
    hasVesselRegistration: boolean;
    hasCrewLicenses: boolean;
    hasInsurance: boolean;
    hasSafetyProtocols: boolean;
  };

  licenseNumber: string;
  insurancePolicyNumber: string;

  wompi: {
    accountId: string;
    acceptanceToken: string;
    bankAccount: {
      bankName: string;
      accountType: "ahorros" | "corriente" | "";
      accountNumber: string;
    };
  };

  createdAt: Date;
  updatedAt: Date;
}

/* =========================================================
   COMPANY SCHEMA (MONGOOSE RUNTIME)
   ========================================================= */

const CompanySchema = new Schema<CompanyDocument>(
  {
    /* =========================
       DATOS BÁSICOS
       ========================= */
    name: {
      type: String,
      required: true,
      trim: true,
    },

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

    owner: {
      type: Schema.Types.ObjectId, // ✅ CORRECTO
      ref: "User",
      required: true,
      index: true,
    },

    admins: [
      {
        type: Schema.Types.ObjectId, // ✅ CORRECTO
        ref: "User",
      },
    ],

    /* =========================
       FINANZAS
       ========================= */
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* =========================
       ESTADO (🔥 CLAVE PARA CASCADA)
       ========================= */
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    deactivatedAt: {
      type: Date,
    },

    transportTypes: {
      type: [String],
      default: ["lancha"],
    },

    /* =========================
       PLAN / SUSCRIPCIÓN
       ========================= */
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
      index: true,
    },

    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive", "past_due", "cancelled"],
      default: "active",
    },

    /* =========================
       DATOS LEGALES
       ========================= */
    nit: {
      type: String,
      trim: true,
      default: "",
    },

    legalRepresentative: {
      type: String,
      trim: true,
      default: "",
    },

    compliance: {
      hasLegalConstitution: { type: Boolean, default: false },
      hasTransportLicense: { type: Boolean, default: false },
      hasVesselRegistration: { type: Boolean, default: false },
      hasCrewLicenses: { type: Boolean, default: false },
      hasInsurance: { type: Boolean, default: false },
      hasSafetyProtocols: { type: Boolean, default: false },
    },

    licenseNumber: {
      type: String,
      default: "",
    },

    insurancePolicyNumber: {
      type: String,
      default: "",
    },

    /* =========================
       WOMPI
       ========================= */
    wompi: {
      accountId: {
        type: String,
        trim: true,
        default: "",
      },
      acceptanceToken: {
        type: String,
        default: "",
      },
      bankAccount: {
        bankName: { type: String, default: "" },
        accountType: {
          type: String,
          enum: ["ahorros", "corriente", ""],
          default: "",
        },
        accountNumber: { type: String, default: "" },
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* =========================================================
   VIRTUALS
   ========================================================= */

CompanySchema.virtual("isVerified").get(function (this: CompanyDocument) {
  return (
    this.compliance.hasLegalConstitution &&
    this.compliance.hasTransportLicense &&
    this.compliance.hasInsurance
  );
});

/**
 * 🔥 VIRTUALS CORREGIDOS (ALINEADOS CON CASCADA)
 */
CompanySchema.virtual("routes", {
  ref: "Route",
  localField: "_id",
  foreignField: "companyId",
});

CompanySchema.virtual("trips", {
  ref: "Trip",
  localField: "_id",
  foreignField: "companyId",
});

/* =========================================================
   EXPORTACIÓN
   ========================================================= */

export const CompanyModel =
  mongoose.models.Company ||
  model<CompanyDocument>("Company", CompanySchema);




// import mongoose, {
//   Schema,
//   model,
//   Types,
//   Document,
// } from "mongoose";

// /* =========================================================
//    COMPANY DOCUMENT (TIPO TYPESCRIPT)
//    ========================================================= */

// /**
//  * CompanyDocument
//  *
//  * 👉 Representa el documento en MongoDB
//  * 👉 SOLO se usa para tipar (TypeScript)
//  *
//  * ⚠️ AQUÍ sí usamos Types.ObjectId
//  */
// export interface CompanyDocument extends Document {
//   name: string;

//   // Relaciones
//   owner: Types.ObjectId;
//   admins: Types.ObjectId[];

//   // Estado financiero
//   balance: number;

//   active: boolean;
//   transportTypes: string[];

//   // Plan y suscripción
//   plan: "free" | "pro" | "enterprise";
//   subscriptionStatus: "active" | "inactive" | "past_due" | "cancelled";

//   // Datos legales
//   nit: string;
//   legalRepresentative: string;

//   compliance: {
//     hasLegalConstitution: boolean;
//     hasTransportLicense: boolean;
//     hasVesselRegistration: boolean;
//     hasCrewLicenses: boolean;
//     hasInsurance: boolean;
//     hasSafetyProtocols: boolean;
//   };

//   licenseNumber: string;
//   insurancePolicyNumber: string;

//   wompi: {
//     accountId: string;
//     acceptanceToken: string;
//     bankAccount: {
//       bankName: string;
//       accountType: "ahorros" | "corriente" | "";
//       accountNumber: string;
//     };
//   };

//   createdAt: Date;
//   updatedAt: Date;
// }

// /* =========================================================
//    COMPANY SCHEMA (MONGOOSE RUNTIME)
//    ========================================================= */

// /**
//  * ⚠️ DIFERENCIA CLAVE
//  *
//  * - Interface (arriba) → Types.ObjectId
//  * - Schema (abajo)     → Schema.Types.ObjectId
//  *
//  * Si no respetas esto → ERROR DE TYPESCRIPT
//  */
// const CompanySchema = new Schema<CompanyDocument>(
//   {
//     /* =========================
//        DATOS BÁSICOS
//        ========================= */
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     /* =========================
//        RELACIONES
//        ========================= */

//     owner: {
//       // ✅ CORRECCIÓN CLAVE AQUÍ
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       index: true,
//     },

//     admins: [
//       {
//         // ✅ CORRECCIÓN CLAVE AQUÍ
//         type: Schema.Types.ObjectId,
//         ref: "User",
//       },
//     ],

//     /* =========================
//        FINANZAS
//        ========================= */
//     balance: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     /* =========================
//        ESTADO
//        ========================= */
//     active: {
//       type: Boolean,
//       default: true,
//     },

//     transportTypes: {
//       type: [String],
//       default: ["lancha"],
//     },

//     /* =========================
//        PLAN / SUSCRIPCIÓN
//        ========================= */
//     plan: {
//       type: String,
//       enum: ["free", "pro", "enterprise"],
//       default: "free",
//       index: true,
//     },

//     subscriptionStatus: {
//       type: String,
//       enum: ["active", "inactive", "past_due", "cancelled"],
//       default: "active",
//     },

//     /* =========================
//        DATOS LEGALES
//        ========================= */
//     nit: {
//       type: String,
//       trim: true,
//       default: "",
//     },

//     legalRepresentative: {
//       type: String,
//       trim: true,
//       default: "",
//     },

//     compliance: {
//       hasLegalConstitution: { type: Boolean, default: false },
//       hasTransportLicense: { type: Boolean, default: false },
//       hasVesselRegistration: { type: Boolean, default: false },
//       hasCrewLicenses: { type: Boolean, default: false },
//       hasInsurance: { type: Boolean, default: false },
//       hasSafetyProtocols: { type: Boolean, default: false },
//     },

//     licenseNumber: {
//       type: String,
//       default: "",
//     },

//     insurancePolicyNumber: {
//       type: String,
//       default: "",
//     },

//     /* =========================
//        WOMPI
//        ========================= */
//     wompi: {
//       accountId: {
//         type: String,
//         trim: true,
//         default: "",
//       },
//       acceptanceToken: {
//         type: String,
//         default: "",
//       },
//       bankAccount: {
//         bankName: { type: String, default: "" },
//         accountType: {
//           type: String,
//           enum: ["ahorros", "corriente", ""],
//           default: "",
//         },
//         accountNumber: { type: String, default: "" },
//       },
//     },
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );

// /* =========================================================
//    VIRTUALS
//    ========================================================= */

// /**
//  * Indica si la empresa está verificada legalmente
//  */
// CompanySchema.virtual("isVerified").get(function (this: CompanyDocument) {
//   return (
//     this.compliance.hasLegalConstitution &&
//     this.compliance.hasTransportLicense &&
//     this.compliance.hasInsurance
//   );
// });

// /**
//  * Relaciones virtuales
//  */
// CompanySchema.virtual("routes", {
//   ref: "Route",
//   localField: "_id",
//   foreignField: "company",
// });

// CompanySchema.virtual("trips", {
//   ref: "Trip",
//   localField: "_id",
//   foreignField: "company",
// });

// /* =========================================================
//    EXPORTACIÓN DEL MODELO
//    ========================================================= */

// export const CompanyModel =
//   mongoose.models.Company ||
//   model<CompanyDocument>("Company", CompanySchema);
