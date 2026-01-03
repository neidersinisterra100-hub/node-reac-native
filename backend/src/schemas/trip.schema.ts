import { z } from "zod";

export const createTripSchema = z.object({
  origin: z.string().min(2),
  destination: z.string().min(2),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  departureTime: z.string().regex(/^\d{2}:\d{2}$/),
  price: z.number().positive(),
  capacity: z.number().positive().optional(),
});
