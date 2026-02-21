import { RequestHandler } from "express";
import mongoose, { Types } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// ===============================
// MODELOS
// ===============================
import { CompanyModel } from "../models/company.model.js";
import { UserModel } from "../models/user.model.js";
import { RouteModel } from "../models/route.model.js";
import { TripModel } from "../models/trip.model.js";
import { CompanyInvitationModel } from "../models/companyInvitation.model.js";
import { sendAdminInvitation } from "../services/email.service.js";

// ===============================
// DOMINIO
// ===============================
import { CompanyDomainService } from "../domain/company/company.domain.service.js";

// ===============================
// TIPOS
// ===============================
import type { CompanyDocument } from "../models/company.model.js";

/* =========================================================
   DTO (Data Transfer Object)
   ---------------------------------------------------------
   - Define la forma en que exponemos la empresa al frontend
   - Evita filtrar campos internos o sensibles
   ========================================================= */

export interface CompanyDTO {
  id: string;
  name: string;
  isActive: boolean;
  plan: "free" | "pro" | "enterprise";
  subscriptionStatus: "active" | "inactive" | "past_due" | "cancelled";
  createdAt: Date;
}

/**
 * Convierte un documento de Mongoose en un DTO limpio
 */
function toCompanyDTO(company: CompanyDocument): CompanyDTO {
  return {
    id: company._id.toString(),
    name: company.name,
    isActive: company.isActive,
    plan: company.plan,
    subscriptionStatus: company.subscriptionStatus,
    createdAt: company.createdAt,
  };
}

/* =========================================================
   CREATE COMPANY
   ---------------------------------------------------------
   - Solo un OWNER puede crear empresas
   - Se asocia automáticamente la empresa al usuario
   - El ownership real empieza aquí
   ========================================================= */

export const createCompany: RequestHandler = async (req, res) => {
  try {
    // requireAuth ya se ejecutó antes
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    // Solo owners pueden crear empresas
    if (req.user.role !== "owner") {
      return res.status(403).json({ message: "Solo owners" });
    }

    // Crear la empresa
    const company = await CompanyModel.create({
      ...req.body,
      owner: new Types.ObjectId(req.user.id),
      isActive: true,
      admins: [],
    });

    // Vincular la empresa al usuario owner
    await UserModel.findByIdAndUpdate(req.user.id, {
      $set: { companyId: company._id },
    });

    return res.status(201).json(toCompanyDTO(company));
  } catch (error) {
    console.error("❌ createCompany error:", error);
    return res.status(500).json({ message: "Error al crear empresa" });
  }
};

/* =========================================================
   LIST MY COMPANIES
   ---------------------------------------------------------
   - OWNER → ve todas sus empresas
   - ADMIN → ve solo la empresa asignada
   ========================================================= */

export const getMyCompanies: RequestHandler = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  const { role, id, companyId } = req.user;

  const companies =
    role === "owner"
      ? await CompanyModel.find({ owner: id })
      : role === "admin" && companyId
        ? await CompanyModel.find({ _id: companyId })
        : [];

  res.json(companies.map(toCompanyDTO));
};

/* =========================================================
   LIST PUBLIC COMPANIES
   ---------------------------------------------------------
   - Retorna todas las empresas activas
   - Usado principalmente por el Dashboard y AllRoutes
   ========================================================= */

export const getPublicCompanies: RequestHandler = async (_req, res) => {
  try {
    const companies = await CompanyModel.find({ isActive: true });
    res.json(companies.map(toCompanyDTO));
  } catch (error) {
    console.error("❌ getPublicCompanies error:", error);
    res.status(500).json({ message: "Error al obtener empresas públicas" });
  }
};

/* =========================================================
   GET COMPANY
   ---------------------------------------------------------
   - ownershipGuard ya validó permisos
   - La empresa viene inyectada en req.company
   ========================================================= */

export const getCompany: RequestHandler = async (req, res) => {
  if (!req.company) {
    return res.status(500).json({
      message: "Empresa no inyectada (ownershipGuard faltante)",
    });
  }

  res.json(toCompanyDTO(req.company));
};

/* =========================================================
   TOGGLE COMPANY ACTIVE
   ---------------------------------------------------------
   - Activa / desactiva una empresa
   - Si se desactiva:
     - Se desactivan TODAS las rutas
     - Se desactivan TODOS los viajes
   - Todo ocurre dentro de una transacción
   ========================================================= */

export const toggleCompanyActive: RequestHandler = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.company) {
      await session.abortTransaction();
      return res.status(500).json({
        message: "Empresa no inyectada (ownershipGuard faltante)",
      });
    }

    const company = req.company;

    // Toggle del estado
    company.isActive = !company.isActive;
    company.deactivatedAt = company.isActive ? undefined : new Date();

    await company.save({ session });

    // 🔥 Cascada descendente
    if (!company.isActive) {
      await RouteModel.updateMany(
        { companyId: company._id },
        { $set: { isActive: false, deactivatedAt: new Date() } },
        { session }
      );

      await TripModel.updateMany(
        { companyId: company._id },
        { $set: { isActive: false, deactivatedAt: new Date() } },
        { session }
      );
    }

    await session.commitTransaction();
    res.json(toCompanyDTO(company));
  } catch (error) {
    await session.abortTransaction();
    console.error("❌ toggleCompanyActive error:", error);
    res.status(500).json({ message: "Error al cambiar estado" });
  } finally {
    session.endSession();
  }
};

/* =========================================================
   DELETE COMPANY (LÓGICO)
   ---------------------------------------------------------
   - No borra físicamente
   - Aplica reglas de dominio
   - Mantiene integridad histórica
   ========================================================= */

export const deleteCompany: RequestHandler = async (req, res) => {
  if (!req.company) {
    return res.status(500).json({
      message: "Empresa no inyectada (ownershipGuard faltante)",
    });
  }

  await CompanyDomainService.deactivateCompany(
    req.company._id.toString()
  );

  res.json({ message: "Empresa eliminada" });
};

/* =========================================================
   CREAR EMPRESA + ADMIN (Transaccional)
   ========================================================= */

export const createCompanyWithAdmin: RequestHandler = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // requireAuth guarantees req.user
    if (!req.user) {
      await session.abortTransaction();
      return res.status(401).json({ message: "No autenticado" });
    }

    if (req.user.role !== "owner") {
      await session.abortTransaction();
      return res.status(403).json({ message: "Solo owners" });
    }

    // Extract both company and admin data
    const {
      adminName,
      adminEmail,
      adminPassword,
      ...companyDataRaw
    } = req.body;

    // Basic validation for location fields
    if (!companyDataRaw.departmentId || !companyDataRaw.municipioId || !companyDataRaw.cityId) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Ubicación requerida (Departamento, Municipio, Ciudad)" });
    }

    // 1. Create Company
    const company = new CompanyModel({
      ...companyDataRaw,
      owner: new Types.ObjectId(req.user.id),
      isActive: true,
      admins: []
    });

    await company.save({ session });

    // 2. Handle Admin User (Link existing or Invite)
    let adminUser: any = null;

    if (adminEmail) {
      let admin = await UserModel.findOne({ email: adminEmail }).session(session);

      if (admin) {
        // Link Existing User
        admin.companyId = company._id;
        admin.role = "admin";
        await admin.save({ session });
        adminUser = admin;

        // Link back to company
        company.admins.push(admin._id);
        await company.save({ session });
      } else if (adminPassword) {
        // [LEGACY/INTERNAL] Create New Admin user with provided password
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        admin = new UserModel({
          name: adminName || "Admin",
          email: adminEmail,
          password: hashedPassword,
          role: "admin",
          companyId: company._id,
          isActive: true,
          verified: true
        });
        await admin.save({ session });
        adminUser = admin;

        // Link back to company
        company.admins.push(admin._id);
        await company.save({ session });
      } else {
        // 🚀 SECURE FLOW: No password -> Create Invitation
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48); // 48h validity

        const invitation = new CompanyInvitationModel({
          companyId: company._id,
          email: adminEmail,
          token,
          expiresAt,
          status: "pending"
        });
        await invitation.save({ session });

        // Enviar email después de commit idealmente, pero aquí lo lanzamos
        const inviteLink = `${process.env.FRONTEND_URL}/accept-invite?token=${token}`;
        await sendAdminInvitation(adminEmail, inviteLink, company.name);
      }
    }

    // Update Owner's companyId
    await UserModel.findByIdAndUpdate(req.user.id, {
      $set: { companyId: company._id },
    }).session(session);


    await session.commitTransaction();

    // Normalize admin response
    const adminResponse = adminUser ? {
      id: adminUser._id.toString(),
      name: adminUser.name,
      email: adminUser.email
    } : null;

    return res.status(201).json({
      company: toCompanyDTO(company),
      admin: adminResponse,
      message: "Empresa creada exitosamente"
    });

  } catch (error: any) {
    await session.abortTransaction();
    console.error("❌ [createCompanyWithAdmin] Error:", error);
    return res.status(500).json({
      message: "Error al crear empresa con admin",
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

/* =========================================================
   GET COMPANY ADMINS
   ========================================================= */

export const getCompanyAdmins: RequestHandler = async (req, res) => {
  try {
    if (!req.company) {
      return res.status(500).json({
        message: "Empresa no inyectada (ownershipGuard faltante)",
      });
    }

    // Populate admins
    await req.company.populate("admins", "name email");

    res.json(req.company.admins);
  } catch (error) {
    console.error("❌ getCompanyAdmins error:", error);
    res.status(500).json({ message: "Error al obtener administradores" });
  }
};

/* =========================================================
   ADMIN MANAGEMENT
   ========================================================= */

// A) AGREGAR ADMIN DIRECTO (Usuario existente por ID)
export const addAdmin: RequestHandler = async (req, res) => {
  try {
    if (req.user?.role !== 'super_owner' && req.company?.owner.toString() !== req.user?.id) {
      return res.status(403).json({ message: "Solo el owner puede gestionar administradores" });
    }
    const { userId } = req.body;

    if (!req.company) return res.status(500).json({ message: "Guard error" });

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // Validations
    if (req.company.owner.toString() === userId) {
      return res.status(400).json({ message: "El owner ya tiene acceso total" });
    }
    if (req.company.admins.some((a: Types.ObjectId) => a.toString() === userId)) {
      return res.status(400).json({ message: "El usuario ya es administrador" });
    }

    // Update Company
    req.company.admins.push(user._id);
    await req.company.save();

    // Update User
    user.role = "admin";
    user.companyId = req.company._id;
    await user.save();

    res.json(toCompanyDTO(req.company));
  } catch (error) {
    console.error("Error adding admin:", error);
    res.status(500).json({ message: "Error al agregar administrador" });
  }
};

// B) REMOVE ADMIN
export const removeAdmin: RequestHandler = async (req, res) => {
  try {
    if (req.user?.role !== 'super_owner' && req.company?.owner.toString() !== req.user?.id) {
      return res.status(403).json({ message: "Solo el owner puede gestionar administradores" });
    }
    const { adminId } = req.params;

    if (!req.company) return res.status(500).json({ message: "Guard error" });

    // Remove from company
    req.company.admins = req.company.admins.filter((id: Types.ObjectId) => id.toString() !== adminId);
    await req.company.save();

    // Update User (revoke access)
    await UserModel.findByIdAndUpdate(adminId, {
      $set: { role: "user", companyId: null }
    });

    res.json(toCompanyDTO(req.company));
  } catch (error) {
    console.error("Error removing admin:", error);
    res.status(500).json({ message: "Error al remover administrador" });
  }
};

// C) INVITE ADMIN
export const inviteAdmin: RequestHandler = async (req, res) => {
  try {
    if (req.user?.role !== 'super_owner' && req.company?.owner.toString() !== req.user?.id) {
      return res.status(403).json({ message: "Solo el owner puede gestionar administradores" });
    }
    const { email } = req.body;
    const company = req.company;

    console.log("📨 inviteAdmin - body:", req.body, "companyId:", company?._id);

    if (!email) {
      return res.status(400).json({ message: "El email es requerido" });
    }

    if (!company) return res.status(500).json({ message: "Guard error: Empresa no inyectada" });

    // 1. Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      // Check if already admin here
      if (company.admins.some((id: Types.ObjectId) => id.toString() === existingUser.id)) {
        return res.status(400).json({ message: `El usuario ${email} ya es administrador de esta empresa` });
      }
      if (company.owner.toString() === existingUser._id.toString()) {
        return res.status(400).json({ message: `El usuario ${email} es el dueño de la empresa` });
      }

      // Add directly
      company.admins.push(existingUser._id);
      await company.save();

      existingUser.role = "admin";
      existingUser.companyId = company._id;
      await existingUser.save();

      return res.json({ message: "Usuario existente agregado como admin" });
    }

    // 2. Create Invitation
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // 48h validity

    await CompanyInvitationModel.create({
      companyId: company._id,
      email,
      token,
      expiresAt,
      status: "pending"
    });

    // 3. Send Email
    const inviteLink = `${process.env.FRONTEND_URL}/accept-invite?token=${token}`;
    const sent = await sendAdminInvitation(email, inviteLink, company.name);

    if (!sent) {
      // Optional: rollback? Or just warn.
      console.warn("Could not send email, but invitation created.");
      return res.json({ message: "Invitación creada, pero hubo un error enviando el email." });
    }

    res.json({ message: "Invitación enviada exitosamente" });

  } catch (error: any) {
    console.error("❌ Error inviting admin:", error);
    res.status(500).json({
      message: "Error al invitar admin",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// D) ACCEPT INVITE
export const acceptInvite: RequestHandler = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { token } = req.body;
    const userId = req.user?.id; // Authenticated user accepting the invite

    if (!userId) {
      await session.abortTransaction();
      return res.status(401).json({ message: "Debes estar logueado para aceptar" });
    }

    const invitation = await CompanyInvitationModel.findOne({
      token,
      status: "pending",
      expiresAt: { $gt: new Date() }
    }).session(session);

    if (!invitation) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invitación inválida o expirada" });
    }

    const company = await CompanyModel.findById(invitation.companyId).session(session);
    if (!company) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Empresa no existe" });
    }

    const user = await UserModel.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Validate emails match? 
    // Strict security: Invite email must match User email
    if (user.email !== invitation.email) {
      await session.abortTransaction();
      return res.status(403).json({ message: "El email de la invitación no coincide con tu usuario" });
    }

    // Apply changes
    if (!company.admins.some((id: Types.ObjectId) => id.toString() === userId)) {
      company.admins.push(user._id);
      await company.save({ session });
    }

    user.role = "admin";
    user.companyId = company._id;
    await user.save({ session });

    // Update Invitation
    invitation.status = "accepted";
    await invitation.save({ session });

    await session.commitTransaction();
    res.json({ message: "Invitación aceptada. Ahora eres admin." });

  } catch (error) {
    await session.abortTransaction();
    console.error("Error accepting invite:", error);
    res.status(500).json({ message: "Error al aceptar invitación" });
  } finally {
    session.endSession();
  }
}