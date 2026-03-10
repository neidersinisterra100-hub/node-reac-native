import { SeatReservationModel } from "../models/seatReservation.model.js";

/* =========================================================
   SEAT EXPIRATION JOB
   ---------------------------------------------------------
   Responsabilidad ÚNICA:
   - Eliminar documentos de reservas expiradas
     cuyo tiempo expiración ya pasó.
   ========================================================= */

export function startSeatExpirationJob() {
  // ⏱️ Ejecutar cada 60 segundos
  const INTERVAL_MS = 60 * 1000;

  setInterval(async () => {
    try {
      const now = new Date();

      const result = await SeatReservationModel.deleteMany({
        expiresAt: { $lt: now },
      });

      // 🔍 Log solo si hubo cambios reales
      if (result.deletedCount > 0) {
        console.log(
          `🧹 [SeatJob] Asientos expirados eliminados: ${result.deletedCount}`
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
