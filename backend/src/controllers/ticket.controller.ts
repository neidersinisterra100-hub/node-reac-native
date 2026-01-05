import { RequestHandler } from "express";
import { TicketModel } from "../models/ticket.model.js";
import { TripModel } from "../models/trip.model.js";
import { CompanyModel } from "../models/company.model.js";
import { AuthRequest } from "../middlewares/requireAuth.js";

/* ================= COMPRAR TIQUETE ================= */

export const buyTicket: RequestHandler = async (
  req,
  res
) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({
        message: "Usuario no autenticado",
      });
    }

    const { tripId } = req.body;

    if (!tripId) {
      return res.status(400).json({
        message: "tripId es obligatorio",
      });
    }

    /* ================= TRIP + ROUTE + COMPANY ================= */

    const trip = await TripModel.findById(tripId).populate({
      path: "route",
      populate: { path: "company" },
    });

    if (!trip || !trip.route) {
      return res.status(404).json({
        message: "Viaje no encontrado",
      });
    }

    const route: any = trip.route;
    const companyId =
      typeof route.company === "object"
        ? route.company._id
        : route.company;

    /* ================= CREATE TICKET ================= */

    const ticket = await TicketModel.create({
      user: authReq.user.id,
      trip: trip._id,
      company: companyId,
      routeName: `${route.origin} → ${route.destination}`,
      transport: "lancha",
      price: trip.price,
      code: Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase(),
    });

    /* ================= UPDATE COMPANY BALANCE ================= */

    await CompanyModel.findByIdAndUpdate(companyId, {
      $inc: { balance: trip.price },
    });

    return res.status(201).json(ticket);
  } catch (error) {
    console.error("❌ Error buyTicket:", error);
    return res.status(500).json({
      message: "Error al comprar el tiquete",
    });
  }
};

/* ================= HISTORIAL DEL USUARIO ================= */

export const getMyTickets: RequestHandler = async (
  req,
  res
) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({
        message: "Usuario no autenticado",
      });
    }

    const tickets = await TicketModel.find({
      user: authReq.user.id,
    })
      .populate({
        path: "trip",
        populate: {
          path: "route",
          populate: { path: "company" },
        },
      })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.json(tickets);
  } catch (error) {
    console.error("❌ Error getMyTickets:", error);
    return res.status(500).json({
      message: "Error al obtener historial",
    });
  }
};



// import { RequestHandler } from "express";
// import Ticket from "../models/ticket.model.js";
// import { TripModel } from "../models/trip.model.js";
// import { CompanyModel } from "../models/company.model.js";
// import { AuthRequest } from "../middlewares/requireAuth.js";

// /* ================= COMPRAR TIQUETE ================= */

// export const buyTicket: RequestHandler = async (
//   req,
//   res
// ) => {
//   try {
//     const authReq = req as AuthRequest;

//     if (!authReq.user) {
//       return res.status(401).json({
//         message: "Usuario no autenticado",
//       });
//     }

//     const { tripId } = req.body;

//     if (!tripId) {
//       return res.status(400).json({
//         message: "tripId es obligatorio",
//       });
//     }

//     // 1️⃣ Buscar viaje + ruta + empresa
//     const trip = await TripModel.findById(tripId).populate({
//       path: "route",
//       populate: { path: "company" },
//     });

//     if (!trip || !trip.route) {
//       return res.status(404).json({
//         message: "Viaje no encontrado",
//       });
//     }

//     const companyId = (trip.route as any).company;

//     // 2️⃣ Crear ticket
//     const ticket = await Ticket.create({
//       user: authReq.user.id,
//       trip: trip._id,
//       company: companyId,
//       price: trip.price,
//       code: Math.random()
//         .toString(36)
//         .substring(2, 8)
//         .toUpperCase(),
//     });

//     // 3️⃣ 💰 Sumar dinero a la empresa
//     await CompanyModel.findByIdAndUpdate(companyId, {
//       $inc: { balance: trip.price },
//     });

//     res.status(201).json(ticket);
//   } catch (error) {
//     console.error("❌ Error buyTicket:", error);
//     res.status(500).json({
//       message: "Error al comprar el tiquete",
//     });
//   }
// };

// /* ================= HISTORIAL DEL USUARIO ================= */

// export const getMyTickets: RequestHandler = async (
//   req,
//   res
// ) => {
//   try {
//     const authReq = req as AuthRequest;

//     if (!authReq.user) {
//       return res.status(401).json({
//         message: "Usuario no autenticado",
//       });
//     }

//     const tickets = await Ticket.find({
//       user: authReq.user.id,
//     })
//       .populate({
//         path: "trip",
//         populate: {
//           path: "route",
//           populate: { path: "company" },
//         },
//       })
//       .sort({ createdAt: -1 })
//       .limit(20);

//     res.json(tickets);
//   } catch (error) {
//     console.error("❌ Error getMyTickets:", error);
//     res.status(500).json({
//       message: "Error al obtener historial",
//     });
//   }
// };


