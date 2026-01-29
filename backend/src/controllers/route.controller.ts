import { RequestHandler } from "express";
import mongoose, { Types } from "mongoose";
import { z } from "zod";

import { RouteModel } from "../models/route.model.js";
import { TripModel } from "../models/trip.model.js";
import { CompanyModel } from "../models/company.model.js";
import { AuthRequest } from "../middlewares/requireAuth.js";
import type { RouteDocument } from "../models/route.model.js";

/* =========================================================
   DTO
   ========================================================= */

export interface RouteDTO {
  id: string;
  origin: string;
  destination: string;
  companyId: string;
  isActive: boolean;
  createdAt: Date;
}

function toRouteDTO(route: RouteDocument): RouteDTO {
  return {
    id: route._id.toString(),
    origin: route.origin,
    destination: route.destination,
    companyId: route.companyId.toString(),
    isActive: route.isActive,
    createdAt: route.createdAt,
  };
}

/* =========================================================
   ZOD SCHEMA
   ========================================================= */

const createRouteSchema = z.object({
  origin: z.string().min(2).transform((v) => v.trim()),
  destination: z.string().min(2).transform((v) => v.trim()),
  companyId: z.string().min(1),
});

/* =========================================================
   CREAR RUTA
   ========================================================= */

export const createRoute: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const parsed = createRouteSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Datos inválidos",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { origin, destination, companyId } = parsed.data;

    // Verificar empresa
    const company = await CompanyModel.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }

    // Verificar permisos
    const isOwner = company.owner.toString() === authReq.user.id;
    const isAdmin =
      authReq.user.role === "admin" &&
      authReq.user.companyId === company._id.toString();

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const route = await RouteModel.create({
      origin,
      destination,
      companyId: company._id, // ✅ FK Correcta
      departmentId: company.departmentId, // 🔥 Derivado desde empresa
      municipioId: company.municipioId, // 🔥 Derivado
      cityId: company.cityId, // 🔥 Derivado
      createdBy: new Types.ObjectId(authReq.user.id),
      isActive: true, // ✅ CORRECTO
    });

    return res.status(201).json(toRouteDTO(route));
  } catch (error) {
    console.error("❌ [createRoute] Error:", error);
    return res.status(500).json({ message: "Error al crear ruta" });
  }
};

/* =========================================================
   LISTAR RUTAS POR EMPRESA
   ========================================================= */

export const getCompanyRoutes: RequestHandler = async (req, res) => {
  const { companyId } = req.params;
  const routes = await RouteModel.find({ companyId }); // ✅ FK Correcta
  return res.json(routes.map(toRouteDTO));
};

/* =========================================================
   TOGGLE RUTA (CON CASCADA)
   ========================================================= */

export const toggleRouteActive: RequestHandler = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const authReq = req as AuthRequest;
    const { routeId } = req.params;

    if (!authReq.user) {
      await session.abortTransaction();
      return res.status(401).json({ message: "No autenticado" });
    }

    const route = await RouteModel.findById(routeId).session(session);
    if (!route) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Ruta no encontrada" });
    }

    // Verificar empresa padre
    const company = await CompanyModel.findById(route.companyId).session(session);
    if (!company) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Empresa padre no encontrada" });
    }

    const isOwner = company.owner.toString() === authReq.user.id;
    const isAdmin =
      authReq.user.role === "admin" &&
      authReq.user.companyId === company._id.toString();

    if (!isOwner && !isAdmin) {
      await session.abortTransaction();
      return res.status(403).json({ message: "No autorizado" });
    }

    // Si vamos a activar, verificar que la empresa esté activa
    if (!route.isActive && !company.isActive) {
      await session.abortTransaction();
      return res.status(409).json({ message: "No puedes activar una ruta si la empresa está inactiva" });
    }

    const newStatus = !route.isActive;
    route.isActive = newStatus;

    if (!newStatus) {
      route.deactivatedAt = new Date();
    } else {
      route.deactivatedAt = undefined;
    }

    await route.save({ session });

    // 🔥 CASCADA: Si desactivamos ruta, desactivar viajes
    if (!newStatus) {
      await TripModel.updateMany(
        { routeId: route._id }, // ✅ FK Correcta
        { $set: { isActive: false, deactivatedAt: new Date() } },
        { session }
      );
    }

    await session.commitTransaction();
    return res.json(toRouteDTO(route));
  } catch (error) {
    await session.abortTransaction();
    console.error("❌ [toggleRouteActive] Error:", error);
    return res.status(500).json({ message: "Error al cambiar estado" });
  } finally {
    session.endSession();
  }
};

/* =========================================================
   ELIMINAR RUTA (SOLO OWNER)
   ========================================================= */

export const deleteRoute: RequestHandler = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const authReq = req as AuthRequest;
    const { routeId } = req.params;

    if (!authReq.user) {
      await session.abortTransaction();
      return res.status(401).json({ message: "No autenticado" });
    }

    const route = await RouteModel.findById(routeId).session(session);
    if (!route) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Ruta no encontrada" });
    }

    const company = await CompanyModel.findById(route.companyId).session(session);
    if (!company || company.owner.toString() !== authReq.user.id) {
      await session.abortTransaction();
      return res.status(403).json({ message: "Solo el owner puede eliminar" });
    }

    // Eliminar viajes asociados
    await TripModel.deleteMany({ routeId: route._id }, { session }); // ✅ FK Correcta

    await RouteModel.findByIdAndDelete(routeId, { session });

    await session.commitTransaction();
    return res.json({ message: "Ruta eliminada" });
  } catch (error) {
    await session.abortTransaction();
    console.error("❌ [deleteRoute] Error:", error);
    return res.status(500).json({ message: "Error al eliminar ruta" });
  } finally {
    session.endSession();
  }
};

export const getRoutesByRole: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;

    const filter: any = {};

    if (authReq.user?.role === "admin" && authReq.user.companyId) {
      filter.companyId = authReq.user.companyId;
    }

    if (authReq.user?.role === "owner") {
      filter.companyId = { $exists: true };
    }

    if (!authReq.user || authReq.user.role === 'user') {
      filter.isActive = true;
    }

    const routes = await RouteModel.find(filter).sort({ createdAt: -1 });
    return res.json(routes);
  } catch (error) {
    console.error("❌ [getRoutesByRole]", error);
    return res.status(500).json({ message: "Error al obtener rutas" });
  }
};
