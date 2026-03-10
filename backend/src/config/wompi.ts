import dotenv from "dotenv";

dotenv.config();

/* =========================================================
   CONFIGURACIÓN WOMPI
   ========================================================= */

/**
 * wompiConfig
 *
 * Este objeto centraliza TODA la configuración
 * relacionada con la pasarela de pagos Wompi.
 *
 * ⚠️ Regla clave:
 * - Checkout (frontend) y Webhooks (backend)
 *   usan secrets DIFERENTES.
 */
export const wompiConfig = {
  /* =========================
     CLAVES DE ACCESO
     ========================= */

  /**
   * Clave pública:
   * - Se puede exponer al frontend
   * - Usada por el widget de pago
   */
  publicKey: process.env.WOMPI_PUBLIC_KEY || "pub_test_...",

  /**
   * Clave privada:
   * - SOLO backend
   * - Usada para operaciones internas (futuro)
   */
  privateKey: process.env.WOMPI_PRIVATE_KEY || "prv_test_...",

  /* =========================
     SEGURIDAD
     ========================= */

  /**
   * integritySecret
   *
   * Usado para:
   * - Generar la firma de integridad del widget
   *
   * ⚠️ NO se usa para webhooks
   */
  integritySecret:
    process.env.WOMPI_INTEGRITY_SECRET || "test_integrity_...",

  /**
   * webhookSecret
   *
   * Usado EXCLUSIVAMENTE para:
   * - Validar la firma de los webhooks
   *
   * En desarrollo:
   * - Puede ser un valor dummy
   *
   * En producción:
   * - Lo entrega Wompi en el dashboard
   */
  webhookSecret:
    process.env.WOMPI_WEBHOOK_SECRET || "test_webhook_secret",

  /* =========================
     ENTORNO
     ========================= */

  /**
   * Entorno de ejecución:
   * - test
   * - production
   */
  environment: process.env.WOMPI_ENV || "test",

  /* =========================
     COMISIONES PLATAFORMA
     ========================= */

  /**
   * ⚠️ Comisión desactivada temporalmente
   * Todo el flujo va para la empresa transportadora.
   */
  platformFeePercentage: 0, // 0%
  platformFeeFixed: 0, // $0 COP

  /* =========================
     API BASE URL
     ========================= */

  /**
   * URL base del API de Wompi
   * Depende del entorno
   */
  apiUrl:
    process.env.WOMPI_ENV === "production"
      ? "https://production.wompi.co/v1"
      : "https://sandbox.wompi.co/v1",
};




// /* =========================================================
//    CONFIGURACIÓN WOMPI
//    ========================================================= */

// /**
//  * wompiConfig
//  *
//  * Centraliza TODA la configuración de Wompi.
//  *
//  * ⚠️ IMPORTANTE:
//  * - integritySecret → checkout / widget
//  * - webhookSecret   → validación de webhooks
//  * - NUNCA deben ser el mismo valor
//  */
// export const wompiConfig = {
//   /* =========================
//      CLAVES PÚBLICAS / PRIVADAS
//      ========================= */

//   publicKey: process.env.WOMPI_PUBLIC_KEY!,
//   privateKey: process.env.WOMPI_PRIVATE_KEY!,

//   /* =========================
//      SEGURIDAD
//      ========================= */

//   /**
//    * Usado para:
//    * - generar hash de integridad del widget
//    */
//   integritySecret: process.env.WOMPI_INTEGRITY_SECRET!,

//   /**
//    * Usado SOLO para:
//    * - validar firmas de webhooks
//    */
//   webhookSecret: process.env.WOMPI_WEBHOOK_SECRET!,

//   /* =========================
//      ENTORNO
//      ========================= */

//   environment: process.env.WOMPI_ENV || "test",

//   /* =========================
//      COMISIONES PLATAFORMA
//      ========================= */

//   platformFeePercentage: 0.05,
//   platformFeeFixed: 1500,

//   /* =========================
//      API URL
//      ========================= */

//   apiUrl:
//     process.env.WOMPI_ENV === "production"
//       ? "https://production.wompi.co"
//       : "https://sandbox.wompi.co",
// };

