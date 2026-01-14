import { RequestHandler } from "express";
import { RouteModel } from "../models/route.model.js";
import { CompanyModel } from "../models/company.model.js";
import { AuthRequest } from "../middlewares/requireAuth.js";

/* ... existing code ... */

export const createRoute: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    if (authReq.user.role !== "owner") {
      return res
        .status(403)
        .json({ message: "Solo los owners pueden crear rutas" });
    }

    const { origin, destination, companyId } = req.body;

    if (!origin || !destination || !companyId) {
      return res.status(400).json({
        message: "origin, destination y companyId son obligatorios",
      });
    }

    const company = await CompanyModel.findById(companyId);

    if (!company) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }

    if (company.owner.toString() !== authReq.user.id) {
      return res.status(403).json({
        message: "No eres owner de esta empresa",
      });
    }

    const exists = await RouteModel.findOne({
      origin: origin.trim(),
      destination: destination.trim(),
      company: companyId,
    });

    if (exists) {
      return res.status(409).json({
        message: "La ruta ya existe para esta empresa",
      });
    }

    const route = await RouteModel.create({
      origin: origin.trim(),
      destination: destination.trim(),
      company: companyId,
      createdBy: authReq.user.id,
      active: true,
    });

    return res.status(201).json(route);
  } catch (error) {
    console.error("❌ Error createRoute:", error);
    return res.status(500).json({
      message: "Error al crear la ruta",
    });
  }
};

export const getCompanyRoutes: RequestHandler = async (req, res) => {
  try {
    const { companyId } = req.params;

    const routes = await RouteModel.find({
      company: companyId,
    }).sort({ createdAt: -1 });

    res.json(routes);
  } catch (error) {
    console.error("❌ Error getCompanyRoutes:", error);
    res.status(500).json({
      message: "Error al obtener rutas",
    });
  }
};

export const toggleRouteActive: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const { routeId } = req.params;

    if (!authReq.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const route = await RouteModel.findById(routeId).populate("company");

    if (!route) {
      return res.status(404).json({ message: "Ruta no encontrada" });
    }

    const company: any = route.company;

    const userRole = authReq.user.role.toLowerCase();

    const isOwner = company.owner.toString() === authReq.user.id;
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "No autorizado para modificar esta ruta",
      });
    }

    route.active = !route.active;
    await route.save();

    res.json(route);
  } catch (error) {
    console.error("❌ Error toggleRouteActive:", error);
    res.status(500).json({
      message: "Error al cambiar estado de la ruta",
    });
  }
};

/* ================= DELETE ROUTE (OWNER ONLY) ================= */
export const deleteRoute: RequestHandler = async (req, res) => {
    try {
      const authReq = req as AuthRequest;
      const { routeId } = req.params;
  
      if (!authReq.user) {
        return res.status(401).json({ message: "No autenticado" });
      }
  
      const route = await RouteModel.findById(routeId).populate("company");
  
      if (!route) {
        return res.status(404).json({ message: "Ruta no encontrada" });
      }
  
      const company: any = route.company;
  
      if (company.owner.toString() !== authReq.user.id) {
        return res.status(403).json({
          message: "No autorizado para eliminar esta ruta",
        });
      }
  
      await RouteModel.findByIdAndDelete(routeId);
  
      res.json({ message: "Ruta eliminada correctamente" });
    } catch (error) {
      console.error("❌ Error deleteRoute:", error);
      res.status(500).json({
        message: "Error al eliminar ruta",
      });
    }
  };
