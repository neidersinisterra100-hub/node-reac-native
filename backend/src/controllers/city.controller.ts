import { RequestHandler } from "express";
import { CityModel } from "../models/city.model.js";
import { AuthRequest } from "../middlewares/requireAuth.js";

/* =========================================================
   CREAR CIUDAD (SOLO OWNER/ADMIN)
   ========================================================= */
/* =========================================================
   CREAR CIUDAD (SOLO OWNER/ADMIN)
   ========================================================= */
export const createCity: RequestHandler = async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const { name, department, departmentId, municipioId } = req.body;

        if (!authReq.user) {
            return res.status(401).json({ message: "No autenticado" });
        }

        if (authReq.user.role !== "owner" && authReq.user.role !== "super_owner") {
            return res.status(403).json({ message: "Solo Owner/SuperOwner pueden crear ciudades" });
        }

        if (!name || !department || !departmentId || !municipioId) {
            return res.status(400).json({ message: "Todos los campos son requeridos" });
        }

        // Validar Municipio
        // Importar MunicipioModel (needs import at top)
        // const municipio = await MunicipioModel.findById(municipioId);
        // if (!municipio) return res.status(404).json({ message: "Municipio no encontrado" });

        const exists = await CityModel.findOne({ name });
        if (exists) {
            return res.status(400).json({ message: "La ciudad ya existe" });
        }

        const city = await CityModel.create({
            name,
            department,
            departmentId,
            municipioId,
            createdBy: authReq.user.id,
        });

        return res.status(201).json(city);
    } catch (error) {
        console.error("❌ [createCity] Error:", error);
        return res.status(500).json({ message: "Error al crear ciudad" });
    }
};

/* =========================================================
   LISTAR CIUDADES (PÚBLICO)
   ========================================================= */
export const getAllCities: RequestHandler = async (req, res) => {
    try {
        const cities = await CityModel.find({ isActive: true }).sort({ name: 1 });
        return res.json(cities);
    } catch (error) {
        console.error("❌ [getAllCities] Error:", error);
        return res.status(500).json({ message: "Error al obtener ciudades" });
    }
};
