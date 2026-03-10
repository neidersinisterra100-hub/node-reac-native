// import { RequestHandler } from "express";
// import { AuthRequest } from "../middlewares/requireAuth.js";
// import { TripModel } from "../models/trip.model.js";
// import { RouteModel } from "../models/route.model.js";
// import { CompanyModel } from "../models/company.model.js";
// import { TicketModel } from "../models/ticket.model.js";

// export const getDashboardStats: RequestHandler = async (req, res) => {
//   try {
//     const authReq = req as AuthRequest;
//     const userId = authReq.user?.id;
//     const userRole = authReq.user?.role;

//     if (!userId) {
//       return res.status(401).json({ message: "No autorizado" });
//     }

//     let totalEarnings = 0;
//     let totalTrips = 0;
//     let totalRoutes = 0;
//     let totalCompanies = 0;
//     let totalLikes = 1259;
//     let rating = 4.8;

//     if (userRole === "owner" || userRole === "admin") {
//       const companies = await CompanyModel.find({ owner: userId });
//       totalCompanies = companies.length;
//       const companyIds = companies.map(c => c._id);

//       const routes = await RouteModel.find({ company: { $in: companyIds } });
//       totalRoutes = routes.length;
      
//       const trips = await TripModel.find({ createdBy: userId });
//       totalTrips = trips.length;
//       const tripIds = trips.map(t => t._id);

//       const tickets = await TicketModel.find({ trip: { $in: tripIds } });
//       totalEarnings = tickets.reduce((sum, ticket) => sum + ticket.price, 0);

//     } else {
//         const myTickets = await TicketModel.find({ user: userId });
//         totalTrips = myTickets.length;
//         totalEarnings = myTickets.reduce((sum, ticket) => sum + ticket.price, 0);
//     }

//     return res.json({
//       earnings: totalEarnings,
//       trips: totalTrips,
//       routes: totalRoutes,
//       companies: totalCompanies,
//       likes: totalLikes,
//       rating: rating,
//       share: totalTrips * 2
//     });

//   } catch (error) {
//     console.error("❌ Error getting dashboard stats:", error);
//     return res.status(500).json({ message: "Error calculando estadísticas" });
//   }
// };
