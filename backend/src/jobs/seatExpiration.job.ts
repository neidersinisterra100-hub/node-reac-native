import { SeatReservationModel } from "../models/seatReservation.model.js";

/* =========================================================
   SEAT EXPIRATION JOB
   ---------------------------------------------------------
   Responsabilidad ÚNICA:
   - Marcar como "expired" los asientos bloqueados
     cuyo tiempo de expiración ya pasó.
   
   ❗ Este job:
   - NO elimina documentos
   - NO toca asientos confirmados
   - NO corre automáticamente por import
   ========================================================= */

export function startSeatExpirationJob() {
  // ⏱️ Ejecutar cada 60 segundos
  const INTERVAL_MS = 60 * 1000;

  setInterval(async () => {
    try {
      const now = new Date();

      const result = await SeatReservationModel.updateMany(
        {
          status: "blocked",
          expiresAt: { $lt: now },
        },
        {
          $set: { status: "expired" },
        }
      );

      // 🔍 Log solo si hubo cambios reales
      if (result.modifiedCount > 0) {
        console.log(
          `🧹 [SeatJob] Asientos expirados liberados: ${result.modifiedCount}`
        );
      }
    } catch (error) {
      console.error(
        "❌ [SeatJob] Error limpiando asientos expirados",
        error
      );
    }
  }, INTERVAL_MS);
}
