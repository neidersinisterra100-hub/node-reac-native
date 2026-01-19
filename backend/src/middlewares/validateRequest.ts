import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

/* =========================================================
   MIDDLEWARE DE VALIDACIÓN GLOBAL (ZOD)
   ========================================================= */

export const validateRequest =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Datos inválidos",
        errors: result.error.flatten().fieldErrors,
      });
    }

    // 🔐 Reemplazamos el body por datos normalizados
    req.body = result.data;
    next();
  };
