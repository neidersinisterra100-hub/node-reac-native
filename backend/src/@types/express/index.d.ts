/**
 * Extensión global de Express
 * ---------------------------------------------------------
 * Este archivo permite tipar propiedades personalizadas
 * en `req` (Request) en TODO el backend.
 *
 * ⚠️ Se carga automáticamente por TypeScript (module augmentation)
 * ⚠️ No se importa manualmente en ningún archivo
 */

import "express";
import type { CompanyDocument } from "../../models/company.model.js";

/* =========================================================
   TIPOS DE AUTENTICACIÓN
   ========================================================= */

/**
 * UserPayload
 *
 * Representa la información mínima y segura
 * que se adjunta al request tras validar el JWT.
 *
 * ⚠️ IMPORTANTE:
 * - Proviene del token (NO de la BD)
 * - NO incluye email (dato mutable / sensible)
 * - Es estable para autorización y ownership
 */
declare global {
  namespace Express {
    interface UserPayload {
      id: string; // ID del usuario (string, no ObjectId)
      role: "user" | "admin" | "owner" | "super_owner";
      companyId?: string; // Presente solo para roles con empresa
    }

    /**
     * Extensión de Express.Request
     *
     * Estas propiedades estarán disponibles en
     * TODOS los controllers y middlewares.
     */
    interface Request {
      /**
       * Usuario autenticado (seteado por requireAuth)
       */
      user?: UserPayload;

      /**
       * Empresa cargada previamente (ownershipGuard, etc.)
       * Evita reconsultar la BD en controllers.
       */
      company?: CompanyDocument;
    }
  }
}

/**
 * Necesario para que TypeScript trate este archivo
 * como un módulo y no como script global suelto.
 */
export {};
