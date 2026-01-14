import { RequestHandler } from "express";
import { AuthRequest } from "../middlewares/requireAuth"; // Ajustar ruta
import { TripModel } from "../models/trip.model";         // Ajustar ruta
import { CompanyModel } from "../models/company.model";   // Ajustar ruta

// Controlador para GET /api/trips/manage
export const getManage: RequestHandler = async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user.id;
        const userRole = authReq.user.role;
        // Asumimos que el modelo de usuario ya tiene (o tendrá) este campo.
        // Si no lo tiene aún en tu JWT, será undefined.
        const ownerId = (authReq.user as any).ownerId; 

        let filter: any = {};

        // Lógica de Jerarquía Owner -> Admin
        if (userRole === 'owner') {
            // El Owner ve sus propias empresas
            const companies = await CompanyModel.find({ owner: userId }).select('_id');
            const companyIds = companies.map(c => c._id);
            filter = { company: { $in: companyIds } };
        } 
        else if (userRole === 'admin') {
            if (ownerId) {
                // CASO IDEAL: El Admin ve las empresas de su Jefe (Owner)
                const companies = await CompanyModel.find({ owner: ownerId }).select('_id');
                const companyIds = companies.map(c => c._id);
                filter = { company: { $in: companyIds } };
            } else {
                // CASO TEMPORAL (mientras implementas ownerId): 
                // Si no hay ownerId vinculado, el admin ve TODO o NADA.
                // Opción A (Ver todo para debug): filter = {}; 
                // Opción B (Estricto): 
                console.warn("Admin user sin ownerId vinculado. Mostrando todas las empresas por defecto (Modo Dev).");
                filter = {}; 
            }
        } else {
            return res.status(403).json({ message: "Rol no autorizado para gestión" });
        }

        // Consulta a la BD con el filtro aplicado
        // Incluye populate para mostrar nombres de ruta y empresa en la tabla
        const trips = await TripModel.find(filter)
            .populate('route', 'name origin destination')
            .populate('company', 'name')
            .sort({ date: -1 }); // Más recientes primero

        return res.json(trips);

    } catch (error) {
        console.error("Error in getManage trips:", error);
        return res.status(500).json({ message: "Error al cargar los viajes" });
    }
};