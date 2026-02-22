import { RequestHandler } from "express";
import { AuditLogModel } from "../models/auditLog.model.js";
import { CompanyModel } from "../models/company.model.js";
import { Types } from "mongoose";

/* =========================================================
   ETIQUETAS LEGIBLES PARA CADA ACCIÓN
   ========================================================= */
const ACTION_LABELS: Record<string, string> = {
    "company.create": "Empresa creada",
    "route.create": "Ruta creada",
    "route.activate": "Ruta activada",
    "route.deactivate": "Ruta desactivada",
    "trip.create": "Viaje creado",
    "trip.activate": "Viaje activado",
    "trip.deactivate": "Viaje desactivado",
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

        const [logs, total] = await Promise.all([
            AuditLogModel.find({ metadata: { $elemMatch: { companyId } } })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("performedBy", "name email role")
                .lean()
                .catch(() =>
                    // Fallback: buscar sin metadata (ya que companyId puede estar en raíz del metadata)
                    AuditLogModel.find({
                        $or: [
                            { "metadata.companyId": companyId },
                            { entityId: new Types.ObjectId(companyId) },
                        ],
                    })
                        .sort({ createdAt: -1 })
                        .skip(skip)
                        .limit(limit)
                        .populate("performedBy", "name email role")
                        .lean()
                ),
            AuditLogModel.countDocuments({
                $or: [
                    { "metadata.companyId": companyId },
                    { entityId: new Types.ObjectId(companyId) },
                ],
            }),
        ]);

        const enriched = logs.map(log => ({
            id: log._id,
            action: log.action,
            actionLabel: ACTION_LABELS[log.action] ?? log.action,
            entity: log.entity,
            entityId: log.entityId,
            performedBy: log.performedBy,
            source: log.source,
            metadata: log.metadata,
            createdAt: log.createdAt,
        }));

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
