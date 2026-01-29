import { Request, Response } from "express";
import { DepartmentModel } from "../models/department.model.js";
import { MunicipioModel } from "../models/municipio.model.js";
import { CityModel } from "../models/city.model.js";
import { CompanyModel } from "../models/company.model.js";
import { RouteModel } from "../models/route.model.js";
import { TripModel } from "../models/trip.model.js";
import { TicketModel } from "../models/ticket.model.js";
import { ScheduleModel } from "../models/schedule.model.js";
import { SeatReservationModel } from "../models/seatReservation.model.js";

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const authReq = req as any;

    if (!name) {
      return res.status(400).json({ message: "Nombre requerido" });
    }

    if (!["owner", "super_owner"].includes(authReq.user.role)) {
      return res.status(403).json({
        message: "Solo Owner/SuperOwner pueden crear departamentos",
      });
    }

    const department = await DepartmentModel.create({
      name: name.trim(),
      createdBy: authReq.user.id, // ✅ FIX
    });

    return res.status(201).json(department);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Department already exists",
      });
    }

    console.error("❌ createDepartment:", error);
    return res.status(500).json({
      message: "Error creating department",
    });
  }
};

// export const createDepartment = async (req: Request, res: Response) => {
//     try {
//         const { name } = req.body;
//         const authReq = req as any;
//         if (authReq.user.role !== "owner" && authReq.user.role !== "super_owner") {
//             return res.status(403).json({ message: "Solo Owner/SuperOwner pueden crear departamentos" });
//         }
//         const userId = authReq.user._id;

//         const department = await DepartmentModel.create({
//             name,
//             createdBy: userId
//         });

//         res.status(201).json(department);
//     } catch (error: any) {
//         if (error.code === 11000) {
//             return res.status(400).json({ message: "Department already exists" });
//         }
//         res.status(500).json({ message: "Error creating department", error });
//     }
// };

export const getAllDepartments = async (req: Request, res: Response) => {
    try {
        const { active } = req.query;
        const query: any = {};

        if (active === "true") {
            query.isActive = true;
        } else if (active === "false") {
            query.isActive = false;
        }

        const departments = await DepartmentModel.find(query).sort({ name: 1 });
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching departments", error });
    }
};

export const toggleDepartmentActive = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const department = await DepartmentModel.findByIdAndUpdate(
            id,
            {
                isActive,
                deactivatedAt: isActive ? undefined : new Date()
            },
            { new: true }
        );

        if (!department) {
            return res.status(404).json({ message: "Department not found" });
        }

        // Cascade deactivation if deactivating department
        if (!isActive) {
            // Deactivate Municipios in this Department
            await MunicipioModel.updateMany({ departmentId: id }, { isActive: false, deactivatedAt: new Date() });

            // Further cascade logic would essentially be recursive:
            // Find all municipios in this department -> Find all cities in those municipios -> etc.
            // For now, simpler cascade:

            // Logically, if the root is inactive, everything below is inaccessible, 
            // but explicitly setting isActive: false helps with data consistency.
        }

        res.json(department);
    } catch (error) {
        res.status(500).json({ message: "Error toggling department status", error });
    }
};
