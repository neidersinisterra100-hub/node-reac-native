import { Request, Response } from "express";

// ===============================
// MODELOS
// ===============================
import { UserModel } from "../models/user.model.js";

// ===============================
// LIBRERÍAS
// ===============================
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ===============================
// SERVICIOS
// ===============================
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../services/email.service.js";

// ===============================
// SECURITY
// ===============================
import { 
  SecurityRequest,
  incrementFailedAttempts,
  resetFailedAttempts,
  resetRateLimitsForEmail,
} from "../middlewares/security/index.js";


// ===============================
// SECRETS
// ===============================
const JWT_SECRET = process.env.JWT_SECRET as string;
const EMAIL_SECRET = process.env.RESEND_API_KEY as string;

/* =========================================================
   REGISTER
   ========================================================= */
export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    const exists = await UserModel.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      verified: false,
      role: "user",
    });

    const verificationToken = jwt.sign(
      { userId: user._id.toString() },
      EMAIL_SECRET,
      { expiresIn: "24h" }
    );

    await sendVerificationEmail(user.email, verificationToken);

    return res.status(201).json({
      message: "Revisa tu correo para verificar tu cuenta",
    });
  } catch (error) {
    console.error("❌ REGISTER ERROR:", error);
    return res.status(500).json({ message: "Error al registrar usuario" });
  }
}

/* =========================================================
   LOGIN
   ========================================================= */
export async function login(req: SecurityRequest, res: Response) {
  try {
    console.log("[AUTH] Login attempt - IP:", req.security?.ip);
    console.log("[AUTH] Login attempt - Device:", req.security?.deviceId?.substring(0, 16) + '...');
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email y contraseña requeridos",
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      // Increment failed attempts even for non-existent users (timing attack prevention)
      // Note: We don't actually increment since user doesn't exist, but we log it
      console.log("[AUTH] Login failed - User not found");
      if (req.security) {
        req.security.auditResult = 'fail';
      }
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      // Increment failed login attempts
      await incrementFailedAttempts(email);
      console.log("[AUTH] Login failed - Invalid password");
      if (req.security) {
        req.security.auditResult = 'fail';
      }
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    if (!user.verified) {
      console.log("[AUTH] Login blocked - Email not verified");
      if (req.security) {
        req.security.auditResult = 'blocked';
        req.security.auditMetadata = { reason: 'email_not_verified' };
      }
      return res.status(403).json({
        message: "Debes verificar tu correo antes de iniciar sesión",
      });
    }

    // ✅ LOGIN SUCCESSFUL
    // Reset failed attempts and rate limits
    await resetFailedAttempts(email);
    await resetRateLimitsForEmail(email);
    
    console.log("[AUTH] Login successful");
    if (req.security) {
      req.security.auditResult = 'success';
    }

    const tokenPayload = {
      id: user._id.toString(),
      role: user.role,
      companyId: user.companyId?.toString(),
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      },
    });
  } catch (error) {
    console.error("❌ LOGIN ERROR:", error);
    if (req.security) {
      req.security.auditResult = 'fail';
      req.security.auditMetadata = { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
    return res.status(500).json({
      message: "Error al iniciar sesión",
    });
  }
}

/* =========================================================
   VERIFY EMAIL
   ========================================================= */
export async function verifyEmail(req: Request, res: Response) {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        message: "Token de verificación inválido",
      });
    }

    const decoded = jwt.verify(token, EMAIL_SECRET) as { userId: string };

    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (user.verified) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?verified=already`
      );
    }

    user.verified = true;
    await user.save();

    return res.redirect(
      `${process.env.FRONTEND_URL}/login?verified=success`
    );
  } catch (error) {
    console.error("❌ VERIFY EMAIL ERROR:", error);
    return res.status(400).json({
      message: "Token expirado o inválido",
    });
  }
}

/* =========================================================
   RESEND VERIFICATION EMAIL
   ========================================================= */
export async function resendVerificationEmail(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email requerido" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (user.verified) {
      return res.status(400).json({
        message: "El correo ya está verificado",
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      EMAIL_SECRET,
      { expiresIn: "24h" }
    );

    await sendVerificationEmail(user.email, token);

    return res.json({
      message: "Correo de verificación reenviado",
    });
  } catch (error) {
    console.error("❌ RESEND VERIFICATION ERROR:", error);
    return res.status(500).json({
      message: "Error al reenviar verificación",
    });
  }
}

/* =========================================================
   REQUEST PASSWORD RESET
   ========================================================= */
export async function requestPasswordReset(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email requerido" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.json({
        message:
          "Si el correo existe, te enviaremos instrucciones para recuperar tu contraseña",
      });
    }

    const resetToken = jwt.sign(
      { userId: user._id.toString() },
      EMAIL_SECRET,
      { expiresIn: "15m" }
    );

    await sendPasswordResetEmail(user.email, resetToken);

    return res.json({
      message:
        "Si el correo existe, te enviaremos instrucciones para recuperar tu contraseña",
    });
  } catch (error) {
    console.error("❌ REQUEST PASSWORD RESET ERROR:", error);
    return res.status(500).json({
      message: "Error al solicitar recuperación",
    });
  }
}

/* =========================================================
   RESET PASSWORD
   ========================================================= */
export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token y contraseña requeridos",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    const decoded = jwt.verify(token, EMAIL_SECRET) as { userId: string };

    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    return res.json({
      message: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    console.error("❌ RESET PASSWORD ERROR:", error);
    return res.status(400).json({
      message: "Token inválido o expirado",
    });
  }
}



// import { Request, Response } from "express";

// // ===============================
// // MODELOS
// // ===============================
// import User from "../models/User.js";
// import { CompanyModel } from "../models/company.model.js";

// // ===============================
// // LIBRERÍAS
// // ===============================
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// // ===============================
// // SERVICIOS
// // ===============================
// import { sendPasswordResetEmail, sendVerificationEmail } from "../services/email.service.js";

// // ===============================
// // SECRETS
// // ===============================
// const JWT_SECRET = process.env.JWT_SECRET as string;
// const EMAIL_SECRET = process.env.EMAIL_SECRET as string;

// /* =========================================================
//    REGISTER
//    ========================================================= */
// /**
//  * POST /api/auth/register
//  *
//  * Responsabilidad:
//  * - Crear usuario
//  * - Hashear contraseña
//  * - Enviar email de verificación
//  *
//  * ❌ NO inicia sesión
//  * ❌ NO devuelve JWT de login
//  */
// export async function register(req: Request, res: Response) {
//   try {
//     const { name, email, password } = req.body;

//     /* =========================
//        VALIDACIONES BÁSICAS
//        ========================= */
//     if (!name || !email || !password) {
//       return res.status(400).json({
//         message: "Datos incompletos",
//       });
//     }

//     /* =========================
//        EVITAR DUPLICADOS
//        ========================= */
//     const exists = await User.findOne({ email });
//     if (exists) {
//       return res.status(400).json({
//         message: "El usuario ya existe",
//       });
//     }

//     /* =========================
//        HASH DE CONTRASEÑA
//        ========================= */
//     const hashedPassword = await bcrypt.hash(password, 10);

//     /* =========================
//        CREAR USUARIO (NO VERIFICADO)
//        ========================= */
//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       verified: false, // 🔐 CLAVE: email aún no confirmado
//     });

//     /* =========================
//        TOKEN DE VERIFICACIÓN
//        ========================= */
//     /**
//      * ⚠️ ESTE TOKEN NO ES DE LOGIN
//      * Solo sirve para verificar el correo
//      */
//     const verificationToken = jwt.sign(
//       { userId: user._id.toString() },
//       EMAIL_SECRET,
//       { expiresIn: "24h" }
//     );

//     /* =========================
//        ENVIAR EMAIL DE VERIFICACIÓN
//        ========================= */
//     await sendVerificationEmail(user.email, verificationToken);

//     /* =========================
//        RESPUESTA
//        ========================= */
//     return res.status(201).json({
//       message: "Revisa tu correo para verificar tu cuenta",
//     });
//   } catch (error) {
//     console.error("REGISTER ERROR:", error);
//     return res.status(500).json({
//       message: "Error al registrar usuario",
//     });
//   }
// }

// /* =========================================================
//    LOGIN
//    ========================================================= */
// /**
//  * POST /api/auth/login
//  *
//  * Responsabilidad:
//  * - Validar credenciales
//  * - Bloquear si email no está verificado
//  * - Resolver empresa
//  * - Firmar JWT de sesión
//  */
// export async function login(req: Request, res: Response) {
//   try {
//     const { email, password } = req.body;

//     /* =========================
//        VALIDACIONES
//        ========================= */
//     if (!email || !password) {
//       return res.status(400).json({
//         message: "Email y contraseña requeridos",
//       });
//     }

//     /* =========================
//        BUSCAR USUARIO
//        ========================= */
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({
//         message: "Credenciales inválidas",
//       });
//     }

//     /* =========================
//        VALIDAR PASSWORD
//        ========================= */
//     const isValid = await bcrypt.compare(password, user.password);
//     if (!isValid) {
//       return res.status(401).json({
//         message: "Credenciales inválidas",
//       });
//     }

//     /* =========================
//        BLOQUEAR SI NO VERIFICADO
//        ========================= */
//     if (!user.verified) {
//       return res.status(403).json({
//         message: "Debes verificar tu correo antes de iniciar sesión",
//       });
//     }

//     /* =========================
//        RESOLVER EMPRESA (OWNER / ADMIN)
//        ========================= */
//     let companyId: string | undefined = undefined;

//     if (user.role === "owner" || user.role === "admin") {
//       const company = await CompanyModel.findOne({
//         owner: user._id,
//       }).select("_id");

//       companyId = company?._id.toString();
//     }

//     /* =========================
//        FIRMAR JWT DE SESIÓN
//        ========================= */
//     const token = jwt.sign(
//       {
//         id: user._id.toString(),
//         email: user.email,
//         role: user.role,
//         companyId,
//       },
//       JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     /* =========================
//        RESPUESTA
//        ========================= */
//     return res.json({
//       user: {
//         id: user._id.toString(),
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//       token,
//     });
//   } catch (error) {
//     console.error("LOGIN ERROR:", error);
//     return res.status(500).json({
//       message: "Error al iniciar sesión",
//     });
//   }
// }

// /* =========================================================
//    VERIFY EMAIL
//    ========================================================= */
// /**
//  * GET /api/auth/verify-email
//  *
//  * Responsabilidad:
//  * - Validar token de verificación
//  * - Marcar usuario como verificado
//  * - Redirigir al frontend (login)
//  *
//  * 🔐 Seguridad:
//  * - Token firmado con EMAIL_SECRET
//  * - Expira automáticamente (24h)
//  */
// export async function verifyEmail(req: Request, res: Response) {
//   try {
//     const { token } = req.query;

//     /* =========================
//        VALIDAR TOKEN
//        ========================= */
//     if (!token || typeof token !== "string") {
//       return res.status(400).json({
//         message: "Token de verificación inválido",
//       });
//     }

//     /* =========================
//        DECODIFICAR TOKEN
//        ========================= */
//     const decoded = jwt.verify(token, EMAIL_SECRET) as {
//       userId: string;
//     };

//     /* =========================
//        BUSCAR USUARIO
//        ========================= */
//     const user = await User.findById(decoded.userId);

//     if (!user) {
//       return res.status(404).json({
//         message: "Usuario no encontrado",
//       });
//     }

//     /* =========================
//        EVITAR DOBLE VERIFICACIÓN
//        ========================= */
//     if (user.verified) {
//       return res.redirect(
//         `${process.env.FRONTEND_URL}/login?verified=already`
//       );
//     }

//     /* =========================
//        MARCAR COMO VERIFICADO
//        ========================= */
//     user.verified = true;
//     await user.save();

//     /* =========================
//        REDIRIGIR AL FRONTEND
//        ========================= */
//     return res.redirect(
//       `${process.env.FRONTEND_URL}/login?verified=success`
//     );
//   } catch (error) {
//     console.error("VERIFY EMAIL ERROR:", error);

//     return res.status(400).json({
//       message: "Token expirado o inválido",
//     });
//   }
// }

// export async function resendVerificationEmail(
//   req: Request,
//   res: Response
// ) {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         message: "Email requerido",
//       });
//     }

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({
//         message: "Usuario no encontrado",
//       });
//     }

//     if (user.verified) {
//       return res.status(400).json({
//         message: "El correo ya está verificado",
//       });
//     }

//     const token = jwt.sign(
//       { userId: user._id.toString() },
//       EMAIL_SECRET,
//       { expiresIn: "24h" }
//     );
    
//     await sendVerificationEmail(user.email, token);

//     return res.json({
//       message: "Correo de verificación reenviado",
//     });
//   } catch (error) {
//     console.error("RESEND VERIFICATION ERROR:", error);
//     return res.status(500).json({
//       message: "Error al reenviar verificación",
//     });
//   }
// }

// /* =========================================================
//    REQUEST PASSWORD RESET
//    ========================================================= */
// /**
//  * POST /api/auth/request-password-reset
//  *
//  * Responsabilidad:
//  * - Validar email
//  * - Generar token temporal
//  * - Enviar email con link de recuperación
//  */
// export async function requestPasswordReset(
//   req: Request,
//   res: Response
// ) {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         message: "Email requerido",
//       });
//     }

//     const user = await User.findOne({ email });

//     /**
//      * ⚠️ Seguridad:
//      * NO revelamos si el email existe o no
//      */
//     if (!user) {
//       return res.json({
//         message:
//           "Si el correo existe, te enviaremos instrucciones para recuperar tu contraseña",
//       });
//     }

//     const resetToken = jwt.sign(
//       { userId: user._id.toString() },
//       EMAIL_SECRET,
//       { expiresIn: "15m" } // corto por seguridad
//     );

//     await sendPasswordResetEmail(user.email, resetToken);

//     return res.json({
//       message:
//         "Si el correo existe, te enviaremos instrucciones para recuperar tu contraseña",
//     });
//   } catch (error) {
//     console.error("REQUEST PASSWORD RESET ERROR:", error);
//     return res.status(500).json({
//       message: "Error al solicitar recuperación",
//     });
//   }
// }

// /* =========================================================
//    RESET PASSWORD
//    ========================================================= */
// /**
//  * POST /api/auth/reset-password
//  *
//  * Responsabilidad:
//  * - Validar token
//  * - Hashear nueva contraseña
//  * - Guardarla
//  */
// export async function resetPassword(
//   req: Request,
//   res: Response
// ) {
//   try {
//     const { token, password } = req.body;

//     if (!token || !password) {
//       return res.status(400).json({
//         message: "Token y contraseña requeridos",
//       });
//     }

//     if (password.length < 6) {
//       return res.status(400).json({
//         message: "La contraseña debe tener al menos 6 caracteres",
//       });
//     }

//     const decoded = jwt.verify(token, EMAIL_SECRET) as {
//       userId: string;
//     };

//     const user = await User.findById(decoded.userId);

//     if (!user) {
//       return res.status(404).json({
//         message: "Usuario no encontrado",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     user.password = hashedPassword;
//     await user.save();

//     return res.json({
//       message: "Contraseña actualizada correctamente",
//     });
//   } catch (error) {
//     console.error("RESET PASSWORD ERROR:", error);
//     return res.status(400).json({
//       message: "Token inválido o expirado",
//     });
//   }
// }

