import { Request, Response } from "express";

// Modelo de usuario (MongoDB)
import User from "../models/User.js";

// Librería para hashear contraseñas
import bcrypt from "bcryptjs";

// JWT para autenticación
import jwt from "jsonwebtoken";

// Modelo de empresa (para owner / admin)
import { CompanyModel } from "../models/company.model.js";

// Clave secreta para firmar tokens
const JWT_SECRET = process.env.JWT_SECRET as string;

/* =========================================================
   REGISTER
   ========================================================= */
/**
 * POST /api/auth/register
 *
 * Responsabilidad:
 * - Crear usuario
 * - Hashear contraseña
 * - Generar JWT inicial
 *
 * ❌ No asigna empresa
 * ❌ No inicia sesión compleja
 */
export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    /* =========================
       VALIDACIONES BÁSICAS
       ========================= */
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Datos incompletos",
      });
    }

    /* =========================
       EVITAR DUPLICADOS
       ========================= */
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        message: "El usuario ya existe",
      });
    }

    /* =========================
       HASH DE CONTRASEÑA
       ========================= */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* =========================
       CREAR USUARIO
       ========================= */
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    /* =========================
       FIRMAR JWT (CORREGIDO)
       ========================= */
    /**
     * ⚠️ JWT NORMALIZADO
     * - id     → string
     * - email  → requerido por AuthUser
     * - role   → permisos
     * - companyId → undefined (aún no tiene empresa)
     */
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,        // ✅ CORRECCIÓN CLAVE
        role: user.role,
        companyId: undefined,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    /* =========================
       RESPUESTA
       ========================= */
    return res.status(201).json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      message: "Error al registrar usuario",
    });
  }
}

/* =========================================================
   LOGIN
   ========================================================= */
/**
 * POST /api/auth/login
 *
 * Responsabilidad:
 * - Validar credenciales
 * - Resolver empresa (si aplica)
 * - Firmar JWT completo
 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    /* =========================
       VALIDACIONES
       ========================= */
    if (!email || !password) {
      return res.status(400).json({
        message: "Email y contraseña requeridos",
      });
    }

    /* =========================
       BUSCAR USUARIO
       ========================= */
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Credenciales inválidas",
      });
    }

    /* =========================
       VALIDAR PASSWORD
       ========================= */
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        message: "Credenciales inválidas",
      });
    }

    /* =========================
       RESOLVER EMPRESA (OWNER / ADMIN)
       ========================= */
    let companyId: string | undefined = undefined;

    if (user.role === "owner" || user.role === "admin") {
      const company = await CompanyModel.findOne({
        owner: user._id, // ajustar si cambia el modelo
      }).select("_id");

      companyId = company?._id.toString();
    }

    /* =========================
       FIRMAR JWT (CORREGIDO)
       ========================= */
    /**
     * ⚠️ JWT CONSISTENTE CON AuthUser
     */
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,        // ✅ CORRECCIÓN CLAVE
        role: user.role,
        companyId,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    /* =========================
       RESPUESTA
       ========================= */
    return res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Error al iniciar sesión",
    });
  }
}



// import { Request, Response } from "express";
// import User from "../models/User.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import { CompanyModel } from "../models/company.model.js";

// const JWT_SECRET = process.env.JWT_SECRET as string;

// /* ================= REGISTER ================= */
// export async function register(req: Request, res: Response) {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({
//         message: "Datos incompletos",
//       });
//     }

//     const exists = await User.findOne({ email });
//     if (exists) {
//       return res.status(400).json({
//         message: "El usuario ya existe",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//     });

//     // 🔒 Registrar no tiene empresa todavía
//     const token = jwt.sign(
//       {
//         id: user._id.toString(),
//         role: user.role,
//         companyId: undefined,
//       },
//       JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     return res.status(201).json({
//       user: {
//         id: user._id.toString(),
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//       token,
//     });
//   } catch (error) {
//     console.error("REGISTER ERROR:", error);
//     return res.status(500).json({
//       message: "Error al registrar usuario",
//     });
//   }
// }

// /* ================= LOGIN ================= */
// export async function login(req: Request, res: Response) {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({
//         message: "Email y contraseña requeridos",
//       });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({
//         message: "Credenciales inválidas",
//       });
//     }

//     const isValid = await bcrypt.compare(password, user.password);
//     if (!isValid) {
//       return res.status(401).json({
//         message: "Credenciales inválidas",
//       });
//     }

//     // 🔎 Buscar empresa asociada (owner / admin)
//     let companyId: string | undefined = undefined;

//     if (user.role === "owner" || user.role === "admin") {
//       const company = await CompanyModel.findOne({
//         owner: user._id, // ajusta si tu modelo usa otro campo
//       }).select("_id");

//       companyId = company?._id.toString();
//     }

//     const token = jwt.sign(
//       {
//         id: user._id.toString(),
//         role: user.role,
//         companyId,
//       },
//       JWT_SECRET,
//       { expiresIn: "7d" }
//     );

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
