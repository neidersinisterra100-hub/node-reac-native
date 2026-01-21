import mongoose from "mongoose";
import { CompanyModel } from "../backend/src/models/company.model";
import { RouteModel } from "../backend/src/models/route.model";
import { TripModel } from "../backend/src/models/trip.model";

const MONGO_URI = process.env.MONGO_URI as string;

async function migrate() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Mongo conectado");

  /* ===============================
     COMPANY
     =============================== */
  const companies = await CompanyModel.find({ active: { $exists: true } });

  for (const company of companies) {
    await CompanyModel.updateOne(
      { _id: company._id },
      {
        $set: {
          isActive: company.active,
        },
        $unset: {
          active: "",
        },
      }
    );
  }

  console.log(`✅ Empresas migradas: ${companies.length}`);

  /* ===============================
     ROUTES
     =============================== */
  const routes = await RouteModel.find({ company: { $exists: true } });

  for (const route of routes) {
    await RouteModel.updateOne(
      { _id: route._id },
      {
        $set: {
          companyId: route.company,
          isActive: route.active ?? true,
        },
        $unset: {
          company: "",
          active: "",
        },
      }
    );
  }

  console.log(`✅ Rutas migradas: ${routes.length}`);

  /* ===============================
     TRIPS
     =============================== */
     const trips = await TripModel.find({
  $or: [{ company: { $exists: true } }, { route: { $exists: true } }],
}).lean<any>();

//   const trips = await TripModel.find({
//     $or: [{ company: { $exists: true } }, { route: { $exists: true } }],
//   });

  for (const trip of trips) {
    await TripModel.updateOne(
      { _id: trip._id },
      {
        $set: {
          companyId: trip.company,
          routeId: trip.route,
          isActive: trip.active ?? true,
        },
        $unset: {
          company: "",
          route: "",
          active: "",
        },
      }
    );
  }

  console.log(`✅ Viajes migrados: ${trips.length}`);

  await mongoose.disconnect();
  console.log("🚀 Migración completada con éxito");
}

migrate().catch((err) => {
  console.error("❌ Error en migración", err);
  process.exit(1);
});
