/**
 * Paleta global de colores de la aplicación
 * - Usar SIEMPRE desde aquí
 * - No hardcodear colores en componentes
 */
export const colors = {
  /* ================= BASE ================= */
  background: "#f8fafc",
  surface: "#ffffff",

  primary: "#2563eb",
  primaryDark: "#1e40af",
  accent: "#06b6d4",

  /* ================= TEXTO ================= */
  textPrimary: "#1f2937",
  textSecondary: "#6b7280",

  /* ================= ESTADOS ================= */
  success: "#16a34a",
  warning: "#f59e0b", // ⚠️ Warning global (formularios, alertas)
  error: "#dc2626",

  /* ================= BORDES ================= */
  border: "#e5e7eb",

  /* ================= DASHBOARD =================
     Colores específicos para métricas y tarjetas
     (no usar success/error directamente)
  */
  dashboard: {
    income: "#22c55e",  // 💰 Ingresos
    expense: "#ef4444", // 💸 Gastos
    orange: "#f59e0b",  // ⚠️ Alertas / métricas neutras
  },
};
