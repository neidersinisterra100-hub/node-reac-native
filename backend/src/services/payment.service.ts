import crypto from "crypto";
import { wompiConfig } from "../config/wompi.js";

/* =========================================================
   TIPOS INTERNOS (CONTRATOS)
   ========================================================= */

/**
 * Resultado del cálculo financiero de un ticket
 *
 * ⚠️ Estos valores se usan para:
 * - Guardar en base de datos
 * - Reportes
 * - Auditoría
 */
export interface PaymentSplit {
  total: number;                // Total pagado por el usuario
  platformFee: number;          // Comisión de la plataforma
  companyNet: number;           // Neto para la empresa (antes de pasarela)
  gatewayFeeEstimated: number;  // Estimado pasarela (informativo)
}

/* =========================================================
   PAYMENT SERVICE
   ========================================================= */

/**
 * PaymentService
 *
 * Centraliza TODA la lógica financiera.
 *
 * ❌ Controllers NO calculan dinero
 * ❌ Models NO calculan dinero
 *
 * ✔️ Un solo lugar = menos errores
 */
export class PaymentService {

  /* =======================================================
     CALCULAR SPLIT DE PAGO
     ======================================================= */

  /**
   * Calcula las comisiones y valores netos de una transacción.
   *
   * @param amount Valor total del ticket (en pesos, COP)
   *
   * Reglas:
   * - platformFeePercentage → comisión porcentual
   * - platformFeeFixed     → (reservado si luego lo usas)
   * - gatewayFeeEstimated  → solo informativo
   */
  static calculateSplit(amount: number): PaymentSplit {
    if (amount <= 0) {
      throw new Error("El monto debe ser mayor a cero");
    }

    /* =========================
       COMISIÓN PLATAFORMA
       ========================= */

    // Comisión porcentual (ej: 5%)
    const platformFeePercentage =
      amount * wompiConfig.platformFeePercentage;

    // Comisión final (redondeada hacia arriba)
    // ⚠️ Importante para no perder centavos
    const platformFee = Math.ceil(platformFeePercentage);

    /* =========================
       COMISIÓN PASARELA (ESTIMADA)
       ========================= */

    /**
     * Wompi cobra aproximadamente:
     * - 2.85% + $800 + IVA
     *
     * ⚠️ Esto NO se cobra manualmente
     * ⚠️ Es solo para reportes
     */
    const gatewayFeeEstimated = Math.ceil(
      amount * 0.0285 + 800
    );

    /* =========================
       NETO PARA LA EMPRESA
       ========================= */

    /**
     * La empresa recibe:
     * Total - comisión plataforma
     *
     * La comisión de Wompi se descuenta automáticamente
     * por la pasarela.
     */
    const companyNet = amount - platformFee;

    return {
      total: amount,
      platformFee,
      companyNet,
      gatewayFeeEstimated,
    };
  }

  /* =======================================================
     GENERAR REFERENCIA DE PAGO
     ======================================================= */

  /**
   * Genera una referencia única para el pago.
   *
   * Formato:
   * TKT-<timestamp>-<random>
   *
   * Ejemplo:
   * TKT-1715432193123-A3F9
   */
  static generatePaymentReference(): string {
    const timestamp = Date.now().toString();
    const random = crypto
      .randomBytes(2)
      .toString("hex")
      .toUpperCase();

    return `TKT-${timestamp}-${random}`;
  }

  /* =======================================================
     HASH DE INTEGRIDAD (WOMPI)
     ======================================================= */

  /**
   * Genera la firma de integridad requerida por Wompi.
   *
   * Algoritmo:
   * SHA256(reference + amount_in_cents + currency + secret)
   */
  static generateIntegritySignature(
    reference: string,
    amountInCents: number,
    currency: string
  ): string {
    const chain = `${reference}${amountInCents}${currency}${wompiConfig.integritySecret}`;

    return crypto
      .createHash("sha256")
      .update(chain)
      .digest("hex");
  }

  /* =======================================================
     VALIDACIÓN DE WEBHOOK WOMPI
     ======================================================= */

  /**
   * Valida la firma de un webhook entrante de Wompi.
   *
   * ⚠️ Este método se usa SOLO en el webhook
   */
  static validateWebhookSignature(
    properties: string,
    timestamp: string,
    secret: string,
    signature: string
  ): boolean {
    /**
     * Algoritmo Wompi v2:
     * SHA256(properties + timestamp + secret)
     */
    const chain = `${properties}${timestamp}${secret}`;

    const hash = crypto
      .createHash("sha256")
      .update(chain)
      .digest("hex");

    return hash === signature;
  }
}



// import crypto from 'crypto';
// import { wompiConfig } from '../config/wompi.js';

// export class PaymentService {
    
//     /**
//      * Calcula las comisiones y valores netos de una transacción
//      * @param amount Valor total del ticket (lo que paga el usuario)
//      */
//     static calculateSplit(amount: number) {
//         // 1. Comisión Plataforma
//         const feePercentage = amount * wompiConfig.platformFeePercentage; // 5%
//         const feeFixed = wompiConfig.platformFeeFixed; // 1500
        
//         // Puedes usar la mayor, la suma, o solo una. Aquí usaremos la suma para el ejemplo.
//         // O según tu ejemplo: $30.000 -> $1.500 plataforma. Eso es 5% exacto.
//         const platformFee = Math.ceil(feePercentage); 

//         // 2. Estimado Comisión Pasarela (Wompi cobra aprox 2.85% + $800 + IVA)
//         // Esto es informativo para tus reportes, Wompi lo descuenta automáticamente.
//         const gatewayFeeEstimated = Math.ceil((amount * 0.0285) + 800); 

//         // 3. Neto para la empresa
//         // Wompi descontará su fee del total. 
//         // Nosotros descontamos NUESTRA comisión.
//         // La empresa recibe: Total - (WompiFee + PlatformFee)
//         // Pero para efectos de registro, nosotros cobramos platformFee.
//         const companyNet = amount - platformFee;

//         return {
//             total: amount,
//             platformFee,
//             companyNet,
//             gatewayFeeEstimated
//         };
//     }

//     /**
//      * Genera una referencia de pago única
//      */
//     static generatePaymentReference(): string {
//         // Ejemplo: TKT-17154321-ABCD
//         const timestamp = Date.now().toString();
//         const random = crypto.randomBytes(2).toString('hex').toUpperCase();
//         return `TKT-${timestamp}-${random}`;
//     }

//     /**
//      * Genera el hash de integridad para Wompi
//      * SHA256(reference + amount_in_cents + currency + secret)
//      */
//     static generateIntegritySignature(reference: string, amountInCents: number, currency: string): string {
//         const chain = `${reference}${amountInCents}${currency}${wompiConfig.integritySecret}`;
//         const hash = crypto.createHash('sha256').update(chain).digest('hex');
//         return hash;
//     }

//     /**
//      * Valida el hash de integridad de un evento (Webhook)
//      */
//     static validateWebhookSignature(properties: any, timestamp: any, secret: string, signature: string): boolean {
//         // Wompi usa un mecanismo específico para validar webhooks v2
//         // SHA256(properties + timestamp + secret)
//         const chain = `${properties}${timestamp}${secret}`;
//         const hash = crypto.createHash('sha256').update(chain).digest('hex');
//         return hash === signature;
//     }
// }
