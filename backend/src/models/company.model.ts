import { Schema, model, Types } from 'mongoose';

const CompanySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    owner: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    balance: {
      type: Number,
      default: 0,
      min: 0,
    },

    active: {
      type: Boolean,
      default: true,
    },

    transportTypes: {
      type: [String],
      default: ['lancha'], // lancha | barco | metrera | bus | etc
    },

    /* =========================================
       NUEVOS CAMPOS DE LEGALIDAD Y COMPLIANCE
       ========================================= */
    
    // Información Legal Básica
    nit: { type: String, trim: true, default: '' },
    legalRepresentative: { type: String, trim: true, default: '' },
    
    // Checklist de Cumplimiento (Se llenan con checkbox)
    compliance: {
        hasLegalConstitution: { type: Boolean, default: false }, // Cámara de Comercio, RUT
        hasTransportLicense: { type: Boolean, default: false },  // Habilitación MinTransporte/Dimar
        hasVesselRegistration: { type: Boolean, default: false }, // Matrículas al día
        hasCrewLicenses: { type: Boolean, default: false },       // Licencias tripulación
        hasInsurance: { type: Boolean, default: false },          // Seguros RC y Pasajeros
        hasSafetyProtocols: { type: Boolean, default: false },    // Chalecos, extintores, etc.
    },
    
    // Detalles adicionales opcionales para mayor transparencia
    licenseNumber: { type: String, default: '' }, // Nro Resolución Habilitación
    insurancePolicyNumber: { type: String, default: '' }, // Nro Póliza
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual: ¿Empresa Verificada? (Cumple los mínimos críticos)
CompanySchema.virtual('isVerified').get(function() {
    // Consideramos verificada si tiene constitución legal, licencia de transporte y seguros
    return this.compliance?.hasLegalConstitution && 
           this.compliance?.hasTransportLicense && 
           this.compliance?.hasInsurance;
});

// Virtual para obtener las rutas de la empresa
CompanySchema.virtual('routes', {
  ref: 'Route',
  localField: '_id',
  foreignField: 'company',
});

// Virtual para obtener los viajes de la empresa
CompanySchema.virtual('trips', {
  ref: 'Trip',
  localField: '_id',
  foreignField: 'company',
});

export const CompanyModel = model('Company', CompanySchema);
