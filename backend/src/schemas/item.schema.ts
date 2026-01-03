import { z } from "zod";

export const createItemSchema = z.object({
  name: z.string().min(1),
  schedule: z.string().datetime(),
  origin: z.string().min(1),
  destination: z.string().min(1),
  price: z.number().positive()
});

export const updateItemSchema = createItemSchema.partial().refine(
  data => Object.keys(data).length > 0,
  { message: "PATCH vacío. Debe enviar al menos un campo para actualizar" }
);

export const idParamSchema = z.object({
  id: z.string().min(1)
});
