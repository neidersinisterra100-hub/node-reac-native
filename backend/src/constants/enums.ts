/* =========================================================
   ENUMS CENTRALIZADOS
   ========================================================= */

export const TRANSPORT_TYPES = ["lancha", "avion", "barco"] as const;
export type TransportType = (typeof TRANSPORT_TYPES)[number];
