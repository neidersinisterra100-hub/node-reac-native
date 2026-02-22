import { RequestHandler } from "express";
import { PaymentService } from "../services/payment.service.js";
import { TicketModel } from "../models/ticket.model.js";
import { SeatReservationModel } from "../models/seatReservation.model.js";
import { wompiConfig } from "../config/wompi.js";

/* =========================================================
   WEBHOOK WOMPI
   ========================================================= */

/**
 * wompiWebhook
 *
 * Este endpoint recibe eventos de Wompi cuando
 * una transacción cambia de estado.
 *
 * ⚠️ IMPORTANTE:
 * - NO requiere autenticación
 * - La seguridad se hace con firma (en producción)
 * - DEBE ser idempotente
 *
 * Flujo real:
 * Wompi → Webhook → Backend → Ticket
 */
export const wompiWebhook: RequestHandler = async (req, res) => {
  try {
    /* =========================
       1. EXTRAER PAYLOAD
       ========================= */

    /**
     * Estructura esperada (simplificada):
     * {
     *   event: "transaction.updated",
     *   data: {
     *     transaction: {
     *       id,
     *       reference,
     *       status,
     *       created_at,
     *       payment_method_type
     *     }
     *   },
     *   signature: { properties, checksum },
     *   timestamp
     * }
     */
    const { event, data, signature, timestamp } = req.body;

    /* =========================
       2. VALIDAR FIRMA (SOLO PRODUCCIÓN)
       ========================= */

    /**
     * En desarrollo:
     * - NO validamos firma
     *
     * En producción:
     * - SIEMPRE validar
     */
    if (process.env.NODE_ENV === "production") {
      const isValid = PaymentService.validateWebhookSignature(
        signature?.properties,
        timestamp,
        wompiConfig.webhookSecret,
        signature?.checksum
      );

      if (!isValid) {
        console.error("❌ Firma de webhook inválida");
        return res.sendStatus(401);
      }
    }

    /* =========================
       3. FILTRAR EVENTOS
       ========================= */

    // Solo nos interesa este evento
    if (event !== "transaction.updated") {
      return res.sendStatus(200);
    }

    /* =========================
       4. EXTRAER TRANSACCIÓN
       ========================= */

    const transaction = data?.transaction;

    if (!transaction) {
      console.error("❌ Payload inválido: no hay transaction");
      return res.sendStatus(200);
    }

    const {
      id: transactionId,
      reference,
      status, // APPROVED | DECLINED | ERROR | VOIDED
      created_at,
      payment_method_type,
    } = transaction;

    console.log(`🔔 WOMPI → ${reference} → ${status}`);

    /* =========================
       5. BUSCAR TICKETS ASOCIADOS
       ========================= */
    const tickets = await TicketModel.find({
      "payment.reference": reference,
    });

    if (tickets.length === 0) {
      console.error("⚠️ No se encontraron tickets para la referencia:", reference);
      return res.sendStatus(200);
    }

    /* =========================
       6. IDEMPOTENCIA
       ========================= */
    // Si todos los tickets ya fueron procesados, ignoramos
    const allProcessed = tickets.every(t => t.status !== "pending_payment");
    if (allProcessed) {
      return res.sendStatus(200);
    }

    /* =========================
       7. ACTUALIZAR ESTADO (MASIVO)
       ========================= */
    const updateData: any = {};

    if (status === "APPROVED") {
      updateData.status = "active";
      updateData["payment.status"] = "APPROVED";
      updateData["payment.transactionId"] = transactionId;
      updateData["payment.paidAt"] = new Date(created_at);
      updateData["payment.paymentMethod"] = "WOMPI";
    } else if (status === "DECLINED" || status === "ERROR" || status === "VOIDED") {
      updateData.status = "cancelled";
      updateData["payment.status"] = "DECLINED";
    }

    if (Object.keys(updateData).length > 0) {
      await TicketModel.updateMany(
        { "payment.reference": reference, status: "pending_payment" },
        { $set: updateData }
      );

      /* =========================
         8. LIBERAR RESERVAS (SI APROBADO)
         ========================= */
      if (status === "APPROVED") {
        const deletePromises = tickets.map(t =>
          SeatReservationModel.deleteOne({
            tripId: t.trip,
            seatNumber: t.seatNumber
          })
        );
        await Promise.all(deletePromises);
      }
    }

    return res.sendStatus(200);

  } catch (error) {
    console.error("❌ Error en webhook Wompi:", error);

    /**
     * En caso de error interno,
     * respondemos 500 para permitir reintento.
     */
    return res.sendStatus(500);
  }
};
