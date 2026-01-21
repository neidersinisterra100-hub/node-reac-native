import { Types } from "mongoose";
import { CompanyModel } from "../../models/company.model.js";
import { RouteModel } from "../../models/route.model.js";
import { TripModel } from "../../models/trip.model.js";

export class CompanyDomainService {
  static async deactivateCompany(companyId: string): Promise<void> {
    if (!Types.ObjectId.isValid(companyId)) {
      throw new Error("ID de empresa inválido");
    }

    const company = await CompanyModel.findById(companyId);

    if (!company) {
      throw new Error("Empresa no encontrada");
    }

    if (!company.isActive) return;

    const now = new Date();

    await CompanyModel.updateOne(
      { _id: companyId },
      {
        $set: {
          isActive: false,
          deactivatedAt: now
        }
      }
    );

    const routes = await RouteModel.find(
      { companyId },
      { _id: 1 }
    ).lean();

    const routeIds = routes.map(r => r._id);

    if (routeIds.length === 0) return;

    await RouteModel.updateMany(
      { _id: { $in: routeIds } },
      {
        $set: {
          isActive: false,
          deactivatedAt: now
        }
      }
    );

    await TripModel.updateMany(
      { routeId: { $in: routeIds } },
      {
        $set: {
          isActive: false,
          deactivatedAt: now
        }
      }
    );
  }
}




// // ===============================
// // DOMAIN SERVICE
// // Company Deactivation (Soft)
// // ===============================

// import { Types } from "mongoose";
// import { CompanyModel } from "../../models/company.model.js";
// import { RouteModel } from "../../models/route.model.js";
// import { TripModel } from "../../models/trip.model.js";

// export class CompanyDomainService {
//   /**
//    * Deactivate a company and ALL its dependencies
//    * - Company
//    * - Routes
//    * - Trips
//    */
//   static async deactivateCompany(companyId: string): Promise<void> {
//     if (!Types.ObjectId.isValid(companyId)) {
//       throw new Error("ID de empresa inválido");
//     }
//     // ===============================
//     // 1️⃣ Validate company exists
//     // ===============================
//     const company = await CompanyModel.findById(companyId);

//     if (!company) {
//       throw new Error("Empresa no encontrada");
//     }

//     if (!company.isActive) {
//       // Idempotente: si ya está apagada no rompe nada
//       return;
//     }

//     // ===============================
//     // 2️⃣ Deactivate company
//     // ===============================
//     await CompanyModel.updateOne(
//       { _id: companyId },
//       {
//         $set: {
//           isActive: false,
//           deactivatedAt: new Date()
//         }
//       }
//     );

//     // ===============================
//     // 3️⃣ Get routes of company
//     // ===============================
//     const routes = await RouteModel.find(
//       { companyId },
//       { _id: 1 }
//     );

//     const routeIds = routes.map(r => r._id);

//     if (routeIds.length === 0) {
//       return; // Empresa sin rutas
//     }

//     // ===============================
//     // 4️⃣ Deactivate routes
//     // ===============================
//     await RouteModel.updateMany(
//       { _id: { $in: routeIds } },
//       {
//         $set: {
//           isActive: false,
//           deactivatedAt: new Date()
//         }
//       }
//     );

//     // ===============================
//     // 5️⃣ Deactivate trips
//     // ===============================
//     await TripModel.updateMany(
//       { routeId: { $in: routeIds } },
//       {
//         $set: {
//           isActive: false,
//           deactivatedAt: new Date()
//         }
//       }
//     );
//   }
// }
