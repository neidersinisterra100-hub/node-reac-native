import { RequestHandler } from "express";
import { AuthRequest } from "../middlewares/requireAuth"; // Ajusta ruta según tu estructura
import { TicketModel } from "../models/ticket.model";     // Ajusta ruta
import { TripModel } from "../models/trip.model";         // Ajusta ruta
import { CompanyModel } from "../models/company.model";   // Ajusta ruta

export const getSalesReport: RequestHandler = async (req, res) => {
    try {
        const { from, to } = req.query;
        const authReq = req as AuthRequest;
        const userId = authReq.user.id;
        const userRole = authReq.user.role; // 'admin' | 'owner' | 'user'

        // 1. Determinar contexto (Admin ve todo, Owner ve sus empresas)
        let companyFilter: any = {};
        
        if (userRole === 'owner') {
            // Buscar las empresas de este dueño
            const myCompanies = await CompanyModel.find({ owner: userId }).select('_id');
            const myCompanyIds = myCompanies.map(c => c._id);
            
            // Buscar viajes de esas empresas
            const myTrips = await TripModel.find({ company: { $in: myCompanyIds } }).select('_id');
            const myTripIds = myTrips.map(t => t._id);
            
            // Filtro final para tickets
            companyFilter = { trip: { $in: myTripIds } };
        } 
        // Si es 'admin', companyFilter se queda vacío {} para traer TODO.

        // 2. Filtro de Fechas
        const dateFilter: any = {};
        if (from && to) {
            dateFilter.createdAt = {
                $gte: new Date(from as string),
                $lte: new Date(to as string)
            };
        }

        // 3. Agregación
        const sales = await TicketModel.aggregate([
            { 
                $match: { 
                    ...companyFilter, 
                    ...dateFilter,
                    status: 'paid' // Solo tickets pagados
                } 
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalSales: { $sum: "$price" },
                    ticketsCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return res.json(sales);

    } catch (error) {
        console.error("Error in getSalesReport:", error);
        return res.status(500).json({ message: "Error generating sales report" });
    }
};

export const getOccupancyReport: RequestHandler = async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user.id;
        const userRole = authReq.user.role;

        // 1. Filtro de Viajes
        let tripFilter: any = { 
            active: true, // Solo viajes activos
            date: { $gte: new Date() } // Solo viajes futuros
        };

        if (userRole === 'owner') {
            const myCompanies = await CompanyModel.find({ owner: userId }).select('_id');
            const myCompanyIds = myCompanies.map(c => c._id);
            tripFilter.company = { $in: myCompanyIds };
        }
        // Admin ve todos los viajes activos futuros

        const trips = await TripModel.find(tripFilter).populate('route', 'name');

        const report = trips.map(trip => {
            const capacity = trip.seats?.length || 0; // Asumiendo estructura array de seats
            const sold = trip.seats?.filter((s: any) => s.status === 'occupied').length || 0;
            const rate = capacity > 0 ? (sold / capacity) * 100 : 0;

            return {
                tripId: trip._id,
                date: trip.date,
                capacity,
                sold,
                occupancyRate: Math.round(rate * 100) / 100
            };
        });

        return res.json(report);

    } catch (error) {
        console.error("Error in getOccupancyReport:", error);
        return res.status(500).json({ message: "Error generating occupancy report" });
    }
};