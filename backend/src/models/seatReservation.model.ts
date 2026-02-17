// src/models/seatReservation.model.ts
import { Schema, model } from "mongoose";

/* =========================================================
   SEAT RESERVATION (BLOQUEO TEMPORAL DE ASIENTO)
   =========================================================
   Este modelo representa un BLOQUEO TEMPORAL, no un ticket.

   REGLAS CLAVE DE DISEÑO:
   ---------------------------------------------------------
   1️⃣ Un asiento bloqueado EXISTE o NO EXISTE
       → NO usamos "expired" como estado persistente

   2️⃣ Si el documento existe:
       → el asiento está ocupado

   3️⃣ Si el documento se elimina:
       → el asiento queda libre

   4️⃣ MongoDB TTL es el ÚNICO responsable
       de liberar asientos por tiempo
   ========================================================= */

const seatReservationSchema = new Schema(
  {
    /* =========================
       VIAJE
       ========================= */
    tripId: {
      type: Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },

    /* =========================
       ASIENTO
       ========================= */
    seatNumber: {
      type: Number,
      required: true,
    },

    /* =========================
       USUARIO QUE BLOQUEA
       =========================
       Sirve para:
       - liberar asiento al cancelar
       - evitar abuso (1 asiento por usuario)
    */
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* =========================
       EXPIRACIÓN DEL BLOQUEO
       =========================
       MongoDB eliminará el documento
       AUTOMÁTICAMENTE cuando expire.
    */
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================================================
   ÍNDICE ÚNICO (REGLA DE ORO)
   =========================================================
   ❌ NO pueden existir dos documentos con:
      - mismo tripId
      - mismo seatNumber

   Esto garantiza:
   - no sobreventa
   - no condiciones de carrera
*/
seatReservationSchema.index(
  { tripId: 1, seatNumber: 1 },
  { unique: true }
);

/* =========================================================
   TTL REAL (CLAVE DE TODO EL PROBLEMA)
   =========================================================
   Cuando expiresAt < now:
   👉 Mongo BORRA el documento
   👉 El asiento queda LIBRE
   👉 El índice único deja de bloquear

   ⚠️ Mongo ejecuta TTL cada ~60 segundos
*/
seatReservationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

/* =========================================================
   EXPORTACIÓN DEL MODELO
   ========================================================= */
export const SeatReservationModel = model(
  "SeatReservation",
  seatReservationSchema
);
