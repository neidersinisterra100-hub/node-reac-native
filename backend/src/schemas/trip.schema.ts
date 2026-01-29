import { z } from "zod";
import { TRANSPORT_TYPES } from "../constants/enums.js";

/* =========================================================
   SCHEMA: CREATE TRIP
   ---------------------------------------------------------
   - Valida SOLO lo que el frontend puede enviar
   - Todo lo demás se deriva desde la Ruta (backend)
   - Evita inconsistencias y ataques
   ========================================================= */

export const createTripSchema = z.object({
  /* =====================================================
     RELACIÓN
     -----------------------------------------------------
     - La ruta define empresa y ubicación
     ===================================================== */
  routeId: z.string().min(1, "La ruta es obligatoria"),

  /* =====================================================
     FECHA Y HORA
     -----------------------------------------------------
     - ISO básico sin timezone
     ===================================================== */
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),

  departureTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:mm)"),

  /* =====================================================
     CAPACIDAD Y PRECIO
     ===================================================== */
  price: z
    .number()
    .min(0, "El precio no puede ser negativo"),

  capacity: z
    .number()
    .int("La capacidad debe ser un entero")
    .min(1, "La capacidad mínima es 1"),

  /* =====================================================
     TIPO DE TRANSPORTE
     -----------------------------------------------------
     - Se normaliza a minúsculas
     - Se valida contra enum central
     ===================================================== */
  transportType: z
    .string()
    .transform((v) => v.toLowerCase())
    .refine(
      (v) =>
        TRANSPORT_TYPES.includes(
          v as (typeof TRANSPORT_TYPES)[number]
        ),
      {
        message: "Tipo de transporte inválido",
      }
    )
    .optional(),
});
