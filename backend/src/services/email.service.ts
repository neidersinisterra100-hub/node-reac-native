import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

/* =========================================================
   PALETA DE COLORES (NAUTICGO)
   ========================================================= */
const colors = {
  background: "#f8fafc",
  surface: "#ffffff",

  primary: "#2563eb",
  primaryDark: "#1e40af",
  accent: "#06b6d4",

  textPrimary: "#1f2937",
  textSecondary: "#6b7280",

  success: "#16a34a",
  warning: "#f59e0b",
  error: "#dc2626",

  border: "#e5e7eb",
};

/* =========================================================
   TEMPLATE BASE (REUTILIZABLE)
   ========================================================= */
function baseEmailTemplate({
  title,
  content,
  buttonText,
  buttonUrl,
}: {
  title: string;
  content: string;
  buttonText?: string;
  buttonUrl?: string;
}) {
  return `
  <div style="background:${colors.background};padding:40px 0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto;">
    <div style="max-width:520px;margin:0 auto;background:${colors.surface};border-radius:12px;border:1px solid ${colors.border};overflow:hidden;">
      
      <div style="background:linear-gradient(135deg,${colors.primary},${colors.accent});padding:24px;text-align:center;color:white;">
        <h1 style="margin:0;font-size:22px;">🚢 NauticGo</h1>
        <p style="margin:8px 0 0;font-size:14px;opacity:.9;">
          Plataforma digital de transporte fluvial
        </p>
      </div>

      <div style="padding:32px;">
        <h2 style="color:${colors.textPrimary};font-size:20px;margin-bottom:12px;">
          ${title}
        </h2>

        <p style="color:${colors.textSecondary};font-size:15px;line-height:1.6;">
          ${content}
        </p>

        ${
          buttonText && buttonUrl
            ? `
          <div style="text-align:center;margin:32px 0;">
            <a href="${buttonUrl}" style="
              background:${colors.primary};
              color:white;
              text-decoration:none;
              padding:14px 28px;
              border-radius:8px;
              font-weight:600;
              display:inline-block;
            ">
              ${buttonText}
            </a>
          </div>
        `
            : ""
        }

        <p style="color:${colors.textSecondary};font-size:13px;margin-top:32px;">
          Si no solicitaste este correo, puedes ignorarlo.
        </p>
      </div>

      <div style="background:${colors.background};padding:16px;text-align:center;font-size:12px;color:${colors.textSecondary};">
        © ${new Date().getFullYear()} NauticGo
      </div>
    </div>
  </div>
  `;
}

/* =========================================================
   EMAIL DE VERIFICACIÓN
   ========================================================= */
export async function sendVerificationEmail(
  to: string,
  token: string
) {
  console.log("📬 [EMAIL SERVICE] Preparando email para:", to);

  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  try {
    const result = await resend.emails.send({
      from: "NauticGo <no-reply@nauticgo.com>",
      to,
      subject: "Verifica tu cuenta en NauticGo",
      html: baseEmailTemplate({
        title: "Verifica tu cuenta",
        content:
          "Gracias por registrarte en NauticGo. Confirma tu correo para activar tu cuenta.",
        buttonText: "Verificar cuenta",
        buttonUrl: verifyUrl,
      }),
    });

    console.log("✅ Resend respondió OK:", result);
  } catch (error) {
    console.error("❌ ERROR enviando email con Resend:", error);
    throw error;
  }
}

   // export async function sendVerificationEmail(
//   to: string,
//   token: string
// ) {
//   console.log("📬 [EMAIL SERVICE] Preparando email para:", to);
//   const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

//   const html = baseEmailTemplate({
//     title: "Verifica tu cuenta",
//     content:
//       "Gracias por registrarte en NauticGo. Para activar tu cuenta, confirma tu correo haciendo clic en el botón de abajo.",
//     buttonText: "Verificar cuenta",
//     buttonUrl: verifyUrl,
//   });

//   await resend.emails.send({
//     from: "NauticGo <no-reply@nauticgo.com>",
//     to,
//     subject: "Verifica tu cuenta en NauticGo",
//     html,
//   });
// }

/* =========================================================
   EMAIL DE RESET DE CONTRASEÑA  🔐
   ========================================================= */
export async function sendPasswordResetEmail(
  to: string,
  token: string
) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const html = baseEmailTemplate({
    title: "Restablecer contraseña",
    content:
      "Recibimos una solicitud para restablecer tu contraseña. Si fuiste tú, haz clic en el botón de abajo. Este enlace expira en 15 minutos.",
    buttonText: "Restablecer contraseña",
    buttonUrl: resetUrl,
  });

  await resend.emails.send({
    from: "NauticGo <no-reply@nauticgo.com>",
    to,
    subject: "Restablece tu contraseña en NauticGo",
    html,
  });
}
