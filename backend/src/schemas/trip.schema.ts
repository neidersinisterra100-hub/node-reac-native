import { z } from "zod";
import { TRANSPORT_TYPES } from "../constants/enums.js";

/* =========================================================
   SCHEMA: CREATE TRIP
   ========================================================= */

export const createTripSchema = z.object({
  routeId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  departureTime: z.string().regex(/^\d{2}:\d{2}$/),
  price: z.number().min(0),
  capacity: z.number().int().min(1),
  transportType: z
    .string()
    .transform((v) => v.toLowerCase())
    .refine((v) => TRANSPORT_TYPES.includes(v as any), {
      message: "Tipo de transporte inválido",
    })
    .optional(),
});
