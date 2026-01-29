/* =========================================================
   SCHEDULER CONSTANTS (n8n + backend)
   ========================================================= */

export const SCHEDULER_SOURCE = {
  MANUAL: "manual",
  N8N: "n8n",
  SYSTEM: "system",
} as const;

export const TRIP_SCHEDULER_ACTION = {
  ACTIVATE: "activate",
  DEACTIVATE: "deactivate",
} as const;

/**
 * Ventana de tolerancia para activación automática
 * Ejemplo:
 * - Si el viaje es hoy
 * - y faltan menos de X minutos
 */
export const TRIP_ACTIVATION_WINDOW_MINUTES = 30;

/**
 * Hora límite para desactivar viajes vencidos
 * (si no fueron usados)
 */
export const TRIP_AUTO_DEACTIVATE_AFTER_HOURS = 6;

/**
 * Estados válidos que el scheduler puede tocar
 */
export const SCHEDULER_ALLOWED_FIELDS = [
  "isActive",
  "deactivatedAt",
] as const;
