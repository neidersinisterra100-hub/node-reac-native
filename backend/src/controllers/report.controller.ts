import { RequestHandler } from "express";
import mongoose from "mongoose";

import { AuthRequest } from "../middlewares/requireAuth.js";
import { TicketModel } from "../models/ticket.model.js";
import { TripModel } from "../models/trip.model.js";

/* =========================================================
   REPORTE DE VENTAS (PLAN PRO)
   ========================================================= */
export const getSalesReport: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;

    /* ---------- Seguridad TypeScript ---------- */
    if (!authReq.user || !authReq.user.companyId) {
      return res.status(401).json({
        message: "Usuario no autenticado o sin empresa",
      });
    }

    const { from, to } = req.query;
    const companyId = authReq.user.companyId;

    if (!from || !to) {
      return res.status(400).json({
        message: "Fechas requeridas (from, to)",
      });
    }

    const startDate = new Date(from as string);
    const endDate = new Date(to as string);
    endDate.setHours(23, 59, 59, 999);

    /* ---------- Agregación Mongo ---------- */
    const sales = await TicketModel.aggregate([
      {
        $lookup: {
          from: "trips",
          localField: "trip",
          foreignField: "_id",
          as: "tripData",
        },
      },
      { $unwind: "$tripData" },
      {
        $match: {
          "tripData.company": new mongoose.Types.ObjectId(companyId),
          status: { $in: ["active", "used"] },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          totalSales: { $sum: "$financials.companyNet" },
          ticketsCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.json(sales);
  } catch (error) {
    console.error("❌ Error getSalesReport:", error);
    return res.status(500).json({
      message: "Error al generar reporte de ventas",
    });
  }
};

/* =========================================================
   REPORTE DE OCUPACIÓN (PLAN PRO)
   ========================================================= */
export const getOccupancyReport: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;

    /* ---------- Seguridad ---------- */
    if (!authReq.user || !authReq.user.companyId) {
      return res.status(401).json({
        message: "Usuario no autenticado o sin empresa",
      });
    }

    const companyId = authReq.user.companyId;

    /* ---------- Obtener viajes ---------- */
    const trips = await TripModel.find({
      company: companyId,
      active: true,
    }).select("date route capacity");

    const report = await Promise.all(
      trips.map(async (trip) => {
        const soldCount = await TicketModel.countDocuments({
          trip: trip._id,
          status: { $in: ["active", "used", "pending_payment"] },
        });

        const capacity = trip.capacity ?? 0;

        return {
          tripId: trip._id,
          date: trip.date,
          capacity,
          sold: soldCount,
          occupancyRate:
            capacity > 0
              ? Math.round((soldCount / capacity) * 100)
              : 0,
        };
      })
    );

    return res.json(report);
  } catch (error) {
    console.error("❌ Error getOccupancyReport:", error);
    return res.status(500).json({
      message: "Error al generar reporte de ocupación",
    });
  }
};
