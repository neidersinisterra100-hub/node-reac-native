/* =========================================================
   ROLES DE USUARIO
   ========================================================= */

/**
 * Roles permitidos en el sistema.
 *
 * - user  → pasajero normal
 * - owner → dueño de una o varias empresas
 * - admin → administrador de una empresa
 */
export type UserRole = "user" | "owner" | "admin" | "super_owner";

/* =========================================================
   USUARIO AUTENTICADO (JWT PAYLOAD NORMALIZADO)
   ========================================================= */

/**
 * AuthUser representa el usuario AUTENTICADO,
 * NO el modelo completo de la base de datos.
 *
 * ⚠️ Reglas importantes:
 * - NO usar _id (eso es de Mongo)
 * - Usar SIEMPRE id como string
 * - Incluir SOLO lo necesario para el backend
 */
export interface AuthUser {
   /**
    * ID del usuario (normalizado a string)
    * Viene de user._id.toString()
    */
   id: string;

   /**
    * Email del usuario
    * Necesario para:
    * - Pagos (Wompi)
    * - Notificaciones
    * - Auditoría
    */
   email: string;

   /**
    * Rol del usuario
    * Controla permisos en middlewares
    */
   role: UserRole;

   /**
    * Empresa asociada (solo admin / owner)
    * Opcional para no romper usuarios normales
    */
   companyId?: string;
}
