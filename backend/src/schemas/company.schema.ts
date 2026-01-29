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

  // ✅ Location fields (REQUIRED)
  departmentId: z.string().min(1, "Departamento requerido"),
  municipioId: z.string().min(1, "Municipio requerido"),
  cityId: z.string().min(1, "Ciudad requerida"),

  // ✅ Admin fields (OPTIONAL for with-admin endpoint)
  adminName: z.string().optional(),
  adminEmail: z.string().email().optional(),
  adminPassword: z.string().min(6).optional(),

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
