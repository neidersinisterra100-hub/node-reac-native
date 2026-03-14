import { RequestHandler } from "express";
import { AuditLogModel } from "../models/auditLog.model.js";
import { CompanyModel } from "../models/company.model.js";
import { RouteModel } from "../models/route.model.js";
import { TripModel } from "../models/trip.model.js";
import { Types } from "mongoose";

/* =========================================================
   ETIQUETAS LEGIBLES PARA CADA ACCIÓN
   ========================================================= */
const ACTION_LABELS: Record<string, string> = {
    "company.create": "Empresa creada",
    "company.activate": "Empresa activada",
    "company.deactivate": "Empresa desactivada",
    "company.delete": "Empresa eliminada",
    "route.create": "Ruta creada",
    "route.activate": "Ruta activada",
    "route.deactivate": "Ruta desactivada",
    "route.delete": "Ruta eliminada",
    "trip.create": "Viaje creado",
    "trip.activate": "Viaje activado",
    "trip.deactivate": "Viaje desactivado",
    "trip.delete": "Viaje eliminado",
    "ticket.manual_purchase": "Ticket registrado manualmente",
    "schedule.activate": "Horario activado",
    "schedule.deactivate": "Horario desactivado",
};

/* =========================================================
   GET /api/audit/company/:companyId
   ---------------------------------------------------------
   Retorna logs de auditoría de una empresa y sus entidades.
   Paginado. Requiere rol owner / admin / super_owner.
   ========================================================= */
export const getCompanyAudit: RequestHandler = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "No autenticado" });

        const { companyId } = req.params;
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, parseInt(req.query.limit as string) || 30);

        if (!Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({ message: "ID de empresa inválido" });
        }

        // Verificar acceso
        const { role, id: userId } = req.user;
        if (role === "user") {
            return res.status(403).json({ message: "Sin permisos" });
        }
        if (role === "admin") {
            if (req.user.companyId !== companyId) {
                return res.status(403).json({ message: "Sin permisos sobre esta empresa" });
            }
        }
        if (role === "owner" || role === "super_owner") {
            const company = await CompanyModel.findOne({
                _id: companyId,
                owner: userId,
            }).lean();
            if (!company && role !== "super_owner") {
                return res.status(403).json({ message: "Sin permisos sobre esta empresa" });
            }
        }

        const skip = (page - 1) * limit;

        const query = {
            $or: [
                { "metadata.companyId": companyId },
                { entityId: new Types.ObjectId(companyId) },
            ],
        };

        const [logs, total] = await Promise.all([
            AuditLogModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("performedBy", "name email role")
                .lean(),
            AuditLogModel.countDocuments(query),
        ]);

        const enriched = await Promise.all(
            logs.map(async (log) => {
                const metadata = (log.metadata ?? {}) as Record<string, unknown>;
                let entityName = "";
                let entitySubtitle = "";

                if (log.entity === "company") {
                    entityName = "Company";
                    entitySubtitle = String(metadata.companyName ?? "");
                    if (!entitySubtitle && Types.ObjectId.isValid(String(log.entityId))) {
                        const company = await CompanyModel.findById(log.entityId).select("name").lean() as any;
                        entitySubtitle = company?.name ?? "";
                    }
                } else if (log.entity === "route") {
                    entityName = "Route";
                    entitySubtitle = String(metadata.routeName ?? "");
                    if (!entitySubtitle && Types.ObjectId.isValid(String(log.entityId))) {
                        const route = await RouteModel.findById(log.entityId).select("origin destination").lean() as any;
                        if (route) {
                            entitySubtitle = `${route.origin} - ${route.destination}`;
                        }
                    }
                } else if (log.entity === "trip") {
                    entityName = "Trip";
                    entitySubtitle = String(metadata.routeName ?? "");
                    if (!entitySubtitle && Types.ObjectId.isValid(String(log.entityId))) {
                        const trip = await TripModel.findById(log.entityId).populate("routeId", "origin destination").lean();
                        const route = trip?.routeId as { origin?: string; destination?: string } | undefined;
                        if (route?.origin && route?.destination) {
                            entitySubtitle = `${route.origin} - ${route.destination}`;
                        }
                    }
                } else {
                    entityName = log.entity;
                }

                return {
                    id: log._id,
                    action: log.action,
                    actionLabel: ACTION_LABELS[log.action] ?? log.action,
                    entity: log.entity,
                    entityName,
                    entitySubtitle,
                    entityId: log.entityId,
                    performedBy: log.performedBy,
                    source: log.source,
                    metadata: log.metadata,
                    createdAt: log.createdAt,
                };
            })
        );

        return res.json({
            data: enriched,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("[getCompanyAudit]", error);
        return res.status(500).json({ message: "Error al obtener auditoría" });
    }
};

/* =========================================================
   GET /api/audit/me
   ---------------------------------------------------------
   Retorna los últimos logs del usuario autenticado.
   ========================================================= */
export const getMyAudit: RequestHandler = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "No autenticado" });

        const { id: userId } = req.user;
        const limit = Math.min(50, parseInt(req.query.limit as string) || 20);

        const logs = await AuditLogModel.find({ performedBy: userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        const enriched = logs.map(log => ({
            id: log._id,
            action: log.action,
            actionLabel: ACTION_LABELS[log.action] ?? log.action,
            entity: log.entity,
            entityId: log.entityId,
            source: log.source,
            metadata: log.metadata,
            createdAt: log.createdAt,
        }));

        return res.json({ data: enriched });
    } catch (error) {
        console.error("[getMyAudit]", error);
        return res.status(500).json({ message: "Error al obtener actividad" });
    }
};
