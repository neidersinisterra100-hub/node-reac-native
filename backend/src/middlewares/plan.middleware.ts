import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './requireAuth.js';
import { CompanyModel } from '../models/company.model.js';

// Jerarquía de planes
const PLAN_LEVELS = {
    free: 0,
    pro: 1,
    enterprise: 2
};

type PlanType = keyof typeof PLAN_LEVELS;

/**
 * Middleware para restringir acceso basado en el plan de la empresa
 * @param minPlan Plan mínimo requerido ('free' | 'pro' | 'enterprise')
 */
export const requirePlan = (minPlan: PlanType) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthRequest;
            
            // 1. Validar autenticación básica
            if (!authReq.user) {
                return res.status(401).json({ message: "No autenticado" });
            }

            // 2. Obtener empresa del usuario
            // Si es owner/admin, usamos su companyId.
            const companyId = authReq.user.companyId; 
            
            if (!companyId) {
                // Si no tiene empresa (ej. es un usuario normal), no aplica restricción de plan B2B
                // Ojo: Si es un endpoint B2B, debería tener empresa.
                return res.status(403).json({ message: "Usuario sin empresa asignada" });
            }

            // 3. Consultar plan de la empresa
            // Optimizacion: Podríamos cachear esto en el token, pero mejor consultar DB para cambios en tiempo real
            const company = await CompanyModel.findById(companyId).select('plan subscriptionStatus');

            if (!company) {
                return res.status(404).json({ message: "Empresa no encontrada" });
            }

            // 4. Validar estado de suscripción
            if (company.subscriptionStatus !== 'active' && company.plan !== 'free') {
                 return res.status(402).json({ 
                     message: "Suscripción inactiva o vencida. Por favor actualiza tu pago.",
                     code: "SUBSCRIPTION_INACTIVE"
                 });
            }

            // 5. Comparar niveles
            const currentLevel = PLAN_LEVELS[company.plan as PlanType] || 0;
            const requiredLevel = PLAN_LEVELS[minPlan];

            if (currentLevel < requiredLevel) {
                return res.status(403).json({ 
                    message: `Esta función requiere un plan ${minPlan.toUpperCase()} o superior.`,
                    code: "PLAN_UPGRADE_REQUIRED",
                    currentPlan: company.plan,
                    requiredPlan: minPlan
                });
            }

            next();
        } catch (error) {
            console.error("❌ Error en requirePlan middleware:", error);
            res.status(500).json({ message: "Error interno verificando plan" });
        }
    };
};
