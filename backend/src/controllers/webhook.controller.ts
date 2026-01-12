import { RequestHandler } from "express";
import { PaymentService } from "../services/payment.service.js";
import { TicketModel } from "../models/ticket.model.js";
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
       5. BUSCAR TICKET
       ========================= */

    const ticket = await TicketModel.findOne({
      "payment.reference": reference,
    });

    /**
     * ⚠️ IMPORTANTE:
     * Si no existe el ticket, respondemos 200
     * para que Wompi NO reintente indefinidamente.
     */
    if (!ticket) {
      console.error("⚠️ Ticket no encontrado:", reference);
      return res.sendStatus(200);
    }

    /* =========================
       6. IDEMPOTENCIA
       ========================= */

    /**
     * Si el ticket ya fue procesado,
     * NO se vuelve a tocar.
     */
    if (ticket.status !== "pending_payment") {
      return res.sendStatus(200);
    }

    /* =========================
       7. ACTUALIZAR ESTADO
       ========================= */

    if (status === "APPROVED") {
      ticket.status = "active";
      ticket.payment.status = "APPROVED";
      ticket.payment.transactionId = transactionId;
      ticket.payment.paidAt = new Date(created_at);
      ticket.payment.paymentMethod = "WOMPI";
    }

    if (status === "DECLINED" || status === "ERROR" || status === "VOIDED") {
      ticket.status = "cancelled";
      ticket.payment.status = "DECLINED";
    }

    await ticket.save();

    /* =========================
       8. RESPONDER A WOMPI
       ========================= */

    /**
     * ⚠️ Wompi espera SIEMPRE 200
     * si el evento fue recibido correctamente.
     */
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
