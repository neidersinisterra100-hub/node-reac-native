import { z } from "zod";

/* =========================================================
   SCHEMA: CREATE COMPANY
   ========================================================= */

export const createCompanySchema = z.object({
  name: z
    .string()
    .min(2, "Nombre inválido")
    .transform((v) => v.trim()),

  nit: z.string().optional(),

  legalRepresentative: z.string().optional(),

  licenseNumber: z.string().optional(),

  insurancePolicyNumber: z.string().optional(),

  compliance: z
    .object({
      hasLegalConstitution: z.boolean().optional(),
      hasTransportLicense: z.boolean().optional(),
      hasVesselRegistration: z.boolean().optional(),
      hasCrewLicenses: z.boolean().optional(),
      hasInsurance: z.boolean().optional(),
      hasSafetyProtocols: z.boolean().optional(),
    })
    .optional(),
});

/* =========================================================
   SCHEMA: UPDATE COMPANY
   ========================================================= */

export const updateCompanySchema = z.object({
  isActive: z.boolean().optional(),
});
