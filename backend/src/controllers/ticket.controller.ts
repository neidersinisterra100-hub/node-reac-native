import { RequestHandler } from "express";
import Ticket from "../models/ticket.model.js";
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

    // 1️⃣ Buscar viaje + ruta + empresa
    const trip = await TripModel.findById(tripId).populate({
      path: "route",
      populate: { path: "company" },
    });

    if (!trip || !trip.route) {
      return res.status(404).json({
        message: "Viaje no encontrado",
      });
    }

    const companyId = (trip.route as any).company;

    // 2️⃣ Crear ticket
    const ticket = await Ticket.create({
      user: authReq.user.id,
      trip: trip._id,
      company: companyId,
      price: trip.price,
      code: Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase(),
    });

    // 3️⃣ 💰 Sumar dinero a la empresa
    await CompanyModel.findByIdAndUpdate(companyId, {
      $inc: { balance: trip.price },
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error("❌ Error buyTicket:", error);
    res.status(500).json({
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

    const tickets = await Ticket.find({
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

    res.json(tickets);
  } catch (error) {
    console.error("❌ Error getMyTickets:", error);
    res.status(500).json({
      message: "Error al obtener historial",
    });
  }
};



// import { Request, Response } from "express";
// import Ticket from "../models/Ticket.js";

// /* ================= COMPRAR TIQUETE ================= */

// export const buyTicket = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const { routeName, price } = req.body;

//     // 🔒 Validación de payload
//     if (!routeName || !price) {
//       return res.status(400).json({
//         message: "routeName y price son obligatorios",
//       });
//     }

//     // 🔒 Validación de auth
//     if (!req.user?.id) {
//       return res.status(401).json({
//         message: "Usuario no autenticado",
//       });
//     }

//     const ticket = await Ticket.create({
//       user: req.user.id,
//       routeName,
//       price,
//       code: Math.random()
//         .toString(36)
//         .substring(2, 8)
//         .toUpperCase(),
//     });

//     res.status(201).json(ticket);
//   } catch (error) {
//     console.error("❌ Error buyTicket:", error);
//     res.status(500).json({
//       message: "Error al comprar el tiquete",
//     });
//   }
// };

// /* ================= HISTORIAL ================= */

// export const getMyTickets = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     if (!req.user?.id) {
//       return res.status(401).json({
//         message: "Usuario no autenticado",
//       });
//     }

//     const tickets = await Ticket.find({
//       user: req.user.id,
//     })
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
