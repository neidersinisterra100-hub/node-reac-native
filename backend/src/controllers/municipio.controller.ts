import { RequestHandler } from "express";
import { MunicipioModel } from "../models/municipio.model.js"; // Asegúrate de agregar .js
import { CityModel } from "../models/city.model.js";
import { CompanyModel } from "../models/company.model.js";
import { RouteModel } from "../models/route.model.js";
import { TripModel } from "../models/trip.model.js";
import { AuthRequest } from "../middlewares/requireAuth.js";
import mongoose from "mongoose";

/* =========================================================
   CREAR MUNICIPIO (SOLO OWNER)
   ========================================================= */
export const createMunicipio: RequestHandler = async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const { name, department, departmentId } = req.body;

        if (!authReq.user) {
            return res.status(401).json({ message: "No autenticado" });
        }

        // Solo OWNER (plataforma o territorial, aquí asumo territorial/super_owner)
        // Adjust role check as needed per REQUIREMENTS (owner creates entities)
        if (authReq.user.role !== "owner" && authReq.user.role !== "super_owner") {
            return res.status(403).json({ message: "Solo Owner puede crear municipios" });
        }

        if (!name || !department || !departmentId) {
            return res.status(400).json({ message: "Nombre, departamento y departmentId requeridos" });
        }

        const exists = await MunicipioModel.findOne({ name });
        if (exists) {
            return res.status(400).json({ message: "El municipio ya existe" });
        }

        const municipio = await MunicipioModel.create({
            name,
            department,
            departmentId,
            createdBy: authReq.user.id,
        });

        return res.status(201).json(municipio);
    } catch (error) {
        console.error("❌ [createMunicipio] Error:", error);
        return res.status(500).json({ message: "Error al crear municipio" });
    }
};

/* =========================================================
   LISTAR MUNICIPIOS (PÚBLICO)
   ========================================================= */
export const getAllMunicipios: RequestHandler = async (req, res) => {
    try {
        // Filtrar solo activos para público general
        // Si se requiere endpoint para gestión (ver inactivos), crear otro o usar query param
        const activeOnly = req.query.active !== "false";
        const filter = activeOnly ? { isActive: true } : {};

        const municipios = await MunicipioModel.find(filter).sort({ name: 1 });
        return res.json(municipios);
    } catch (error) {
        console.error("❌ [getAllMunicipios] Error:", error);
        return res.status(500).json({ message: "Error al obtener municipios" });
    }
};

/* =========================================================
   TOGGLE ACTIVE (CASCADA)
   ========================================================= */
export const toggleMunicipioActive: RequestHandler = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const authReq = req as AuthRequest;
        const { id } = req.params;
        const { isActive } = req.body; // Boolean

        if (!authReq.user || (authReq.user.role !== "owner" && authReq.user.role !== "super_owner")) {
            return res.status(403).json({ message: "No autorizado" });
        }

        const municipio = await MunicipioModel.findById(id).session(session);
        if (!municipio) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Municipio no encontrado" });
        }

        municipio.isActive = isActive;
        if (!isActive) {
            municipio.deactivatedAt = new Date();
        } else {
            municipio.deactivatedAt = undefined;
        }
        await municipio.save({ session });

        // 🔥 CASCADA DE DESACTIVACIÓN
        if (!isActive) {
            // 1. Desactivar Ciudades
            await CityModel.updateMany(
                { municipioId: id },
                { $set: { isActive: false } }
            ).session(session);

            // 2. Desactivar Empresas (vinculadas a esas ciudades o directo al municipio si hubiera link, pero vamos por Id)
            await CompanyModel.updateMany(
                { municipioId: id },
                { $set: { isActive: false, deactivatedAt: new Date() } }
            ).session(session);

            // 3. Desactivar Rutas
            await RouteModel.updateMany(
                { municipioId: id },
                { $set: { isActive: false, deactivatedAt: new Date() } }
            ).session(session);

            // 4. Desactivar Viajes
            await TripModel.updateMany(
                { municipioId: id },
                { $set: { isActive: false, deactivatedAt: new Date() } }
            ).session(session);
        }
        // NOTA: Si se reactiva (isActive = true), NO reactivamos en cascada automáticamente 
        // porque no sabemos cuáles estaban activos antes. Se debe hacer manual o con lógica más compleja.
        // Por ahora, solo cascada de desactivación.

        await session.commitTransaction();
        return res.json(municipio);

    } catch (error) {
        await session.abortTransaction();
        console.error("❌ [toggleMunicipioActive] Error:", error);
        return res.status(500).json({ message: "Error al actualizar estado del municipio" });
    } finally {
        session.endSession();
    }
};
