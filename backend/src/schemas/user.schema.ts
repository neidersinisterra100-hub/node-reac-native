import { z } from "zod";

// Helper: treat empty strings as undefined so optional min-length rules don't reject ""
const optStr = (min: number, msg: string) =>
    z.preprocess(
        v => (typeof v === "string" && v.trim() === "" ? undefined : v),
        z.string().min(min, msg).optional()
    );

// phone: exactly 10 digits (Colombian mobile standard)
const phoneField = z.preprocess(
    v => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string()
        .regex(/^\d{10}$/, "El teléfono debe tener exactamente 10 dígitos")
        .optional()
);

export const updateProfileSchema = z.object({
    name: optStr(3, "El nombre debe tener al menos 3 caracteres"),
    identificationNumber: optStr(5, "Identificación no válida"),
    phone: phoneField,
    birthDate: z.string().optional(),
    address: optStr(3, "Dirección requerida"),
    emergencyContactName: optStr(3, "Nombre de contacto no válido"),
    emergencyContactPhone: phoneField,
}).refine(
    data => Object.values(data).some(v => v !== undefined && v !== ""),
    { message: "Al menos un campo debe ser proporcionado" }
);
