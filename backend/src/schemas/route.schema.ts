import { z } from "zod";

/* =========================================================
   SCHEMA: CREATE ROUTE
   ========================================================= */

export const createRouteSchema = z.object({
  origin: z
    .string()
    .min(2, "Origen inválido")
    .transform((v) => v.trim().toUpperCase()),

  destination: z
    .string()
    .min(2, "Destino inválido")
    .transform((v) => v.trim().toUpperCase()),

  companyId: z.string().min(1, "companyId es obligatorio"),
});

/* =========================================================
   SCHEMA: UPDATE ROUTE (TOGGLE / PATCH)
   ========================================================= */

export const updateRouteSchema = z.object({
  isActive: z.boolean().optional(),
});
