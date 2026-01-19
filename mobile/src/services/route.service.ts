import { api } from "./api";
import { loadSession } from "../utils/authStorage";
import { Company } from "./company.service";

/* ================= TYPES ================= */

export interface Route {
  _id: string;
  origin: string;
  destination: string;
  company: string | { _id: string; name: string };
  active: boolean;
}

/* ================= GET ALL ROUTES ================= */
/**
 * Reglas:
 * - Owner/Admin → solo rutas de SUS empresas
 * - Usuario/Público → rutas públicas
 */
export async function getAllRoutes(): Promise<Route[]> {
  try {
    const session = await loadSession();
    const role = session?.user?.role;
    const isPrivileged = role === "owner" || role === "admin";

    /* =================================================
       OWNER / ADMIN → rutas de sus empresas
       ================================================= */
    if (isPrivileged) {
      try {
        const { data: companies } = await api.get<Company[]>(
          "/companies/my"
        );

        if (!companies.length) {
          console.warn(
            "⚠️ [ROUTES] Usuario sin empresas asignadas"
          );
          return [];
        }

        const routesByCompany = await Promise.all(
          companies.map((company) =>
            api
              .get<Route[]>(
                `/routes/company/${company._id}`
              )
              .then((res) => res.data)
              .catch(() => [])
          )
        );

        const allRoutes = routesByCompany.flat();

        // Deduplicación por seguridad
        return Array.from(
          new Map(allRoutes.map((r) => [r._id, r]))
            .values()
        );
      } catch (err) {
        console.warn(
          "⚠️ [ROUTES] No se pudieron cargar rutas privadas, fallback a públicas"
        );
      }
    }

    /* =================================================
       USUARIO / PÚBLICO → rutas públicas
       ================================================= */
    const { data } = await api.get<Route[]>("/routes");
    return data;
  } catch (error) {
    console.error(
      "❌ [ROUTES] Error en getAllRoutes",
      error
    );
    return [];
  }
}

/* ================= GET ROUTES BY COMPANY ================= */
/**
 * Backend ya valida permisos
 */
export async function getCompanyRoutes(
  companyId: string
): Promise<Route[]> {
  const { data } = await api.get<Route[]>(
    `/routes/company/${companyId}`
  );
  return data;
}

/* ================= CREATE ROUTE ================= */

export async function createRoute(data: {
  origin: string;
  destination: string;
  companyId: string;
}): Promise<Route> {
  const res = await api.post<Route>("/routes", data);
  return res.data;
}

/* ================= TOGGLE ROUTE ACTIVE ================= */

export async function toggleRouteActive(
  routeId: string
): Promise<Route> {
  const res = await api.patch<Route>(
    `/routes/${routeId}`
  );
  return res.data;
}

/* ================= DELETE ROUTE ================= */

export async function deleteRoute(
  routeId: string
): Promise<void> {
  await api.delete(`/routes/${routeId}`);
}

/* ================= COMPAT ================= */

export const routeService = {
  getAll: getAllRoutes,
  getCompanyRoutes,
  create: createRoute,
  toggleActive: toggleRouteActive,
  delete: deleteRoute,
};




// import { api } from "./api";
// import { loadSession } from "../utils/authStorage";
// import { Company } from "./company.service";

// /* ================= TYPES ================= */

// export interface Route {
//   _id: string;
//   origin: string;
//   destination: string;
//   company: string | { _id: string; name: string };
//   active: boolean;
// }

// /* ================= GET ALL ROUTES ================= */

// export async function getAllRoutes() {
//   console.log("🟢 [ROUTES] getAllRoutes iniciado");

//   try {
//     console.log("🔍 [ROUTES] Cargando sesión...");
//     const session = await loadSession();
//     console.log("✅ [ROUTES] Sesión:", session);

//     const role = session?.user?.role;
//     const isOwner = role === "owner" || role === "admin";

//     console.log(
//       `👤 [ROUTES] Rol: ${role ?? "public"} | isOwner: ${isOwner}`
//     );

//     /**
//      * CASO 1: OWNER / ADMIN
//      */
//     if (isOwner) {
//       console.log("🏢 [ROUTES] Intentando cargar empresas del owner...");

//       try {
//         const resCompanies = await api.get("/companies/my");
//         console.log(
//           "✅ [ROUTES] Empresas obtenidas:",
//           resCompanies.data
//         );

//         const companies = resCompanies.data as Company[];

//         if (!companies.length) {
//           console.warn(
//             "⚠️ [ROUTES] Owner sin empresas, retornando vacío"
//           );
//           return [];
//         }

//         console.log(
//           `📦 [ROUTES] Buscando rutas de ${companies.length} empresas`
//         );

//         const promises = companies.map((c) =>
//           api
//             .get(`/routes/company/${c._id}`)
//             .then((res) => {
//               console.log(
//                 `✅ [ROUTES] Rutas empresa ${c._id}:`,
//                 res.data
//               );
//               return res.data;
//             })
//             .catch((err) => {
//               console.error(
//                 `❌ [ROUTES] Error rutas empresa ${c._id}`,
//                 err
//               );
//               return [];
//             })
//         );

//         const results = await Promise.all(promises);
//         const allRoutes = results.flat() as Route[];

//         console.log(
//           `📊 [ROUTES] Total rutas antes de deduplicar: ${allRoutes.length}`
//         );

//         const uniqueRoutes = Array.from(
//           new Map(allRoutes.map((r) => [r._id, r])).values()
//         );

//         console.log(
//           `🧹 [ROUTES] Total rutas finales: ${uniqueRoutes.length}`
//         );

//         return uniqueRoutes;
//       } catch (err) {
//         console.warn(
//           "⚠️ [ROUTES] Falló /companies/my, usando rutas públicas",
//           err
//         );
//       }
//     }

//     /**
//      * CASO 2: USUARIO / PÚBLICO
//      */
//     console.log("🌍 [ROUTES] Cargando rutas públicas /routes");

//     const resRoutes = await api.get("/routes");

//     console.log(
//       "✅ [ROUTES] Rutas públicas obtenidas:",
//       resRoutes.data
//     );

//     return resRoutes.data as Route[];
//   } catch (error) {
//     console.error(
//       "❌ [ROUTES] Error fatal en getAllRoutes:",
//       error
//     );
//     return [];
//   }
// }

// /* ================= GET ROUTES BY COMPANY ================= */

// export async function getCompanyRoutes(companyId: string) {
//   console.log(
//     `🏢 [ROUTES] getCompanyRoutes empresa ${companyId}`
//   );

//   const response = await api.get(
//     `/routes/company/${companyId}`
//   );

//   console.log(
//     `✅ [ROUTES] Rutas empresa ${companyId}:`,
//     response.data
//   );

//   return response.data as Route[];
// }

// /* ================= CREATE ROUTE ================= */

// export async function createRoute(data: {
//   origin: string;
//   destination: string;
//   companyId: string;
// }) {
//   console.log("➕ [ROUTES] Creando ruta:", data);

//   const response = await api.post("/routes", data);

//   console.log(
//     "✅ [ROUTES] Ruta creada:",
//     response.data
//   );

//   return response.data as Route;
// }

// /* ================= TOGGLE ROUTE ACTIVE ================= */

// export async function toggleRouteActive(routeId: string) {
//   console.log(
//     `🔁 [ROUTES] Toggle active ruta ${routeId}`
//   );

//   const response = await api.patch(
//     `/routes/${routeId}`
//   );

//   console.log(
//     `✅ [ROUTES] Ruta actualizada:`,
//     response.data
//   );

//   return response.data as Route;
// }

// /* ================= DELETE ROUTE ================= */

// export async function deleteRoute(routeId: string) {
//   console.log(
//     `🗑️ [ROUTES] Eliminando ruta ${routeId}`
//   );

//   const response = await api.delete(
//     `/routes/${routeId}`
//   );

//   console.log(
//     `✅ [ROUTES] Ruta eliminada`
//   );

//   return response.data;
// }

// /* ================= COMPAT ================= */

// export const routeService = {
//   getAll: getAllRoutes,
//   getCompanyRoutes,
//   create: createRoute,
//   toggleActive: toggleRouteActive,
//   delete: deleteRoute,
// };




// import { api } from "./api";
// import { loadSession } from "../utils/authStorage";
// import { Company } from "./company.service";

// /* ================= TYPES ================= */

// export interface Route {
//   _id: string;
//   origin: string;
//   destination: string;
//   company: string | { _id: string; name: string };
//   active: boolean;
// }

// /* ================= GET ALL ROUTES ================= */

// export async function getAllRoutes() {
//   try {
//     const session = await loadSession();
//     const role = session?.user?.role;
//     const isOwner = role === "owner" || role === "admin";

//     /**
//      * CASO 1: OWNER / ADMIN
//      * → rutas por empresa
//      */
//     if (isOwner) {
//       try {
//         const resCompanies = await api.get("/companies/my");
//         const companies = resCompanies.data as Company[];

//         if (!companies.length) return [];

//         const promises = companies.map((c) =>
//           api
//             .get(`/routes/company/${c._id}`)
//             .then((res) => res.data)
//             .catch(() => [])
//         );

//         const results = await Promise.all(promises);
//         const allRoutes = results.flat() as Route[];

//         // deduplicación
//         return Array.from(
//           new Map(allRoutes.map((r) => [r._id, r])).values()
//         );
//       } catch (err) {
//         console.warn(
//           "⚠️ No se pudieron cargar empresas del owner, usando rutas públicas"
//         );
//       }
//     }

//     /**
//      * CASO 2: USUARIO / PÚBLICO
//      * → rutas públicas directas
//      */
//     const resRoutes = await api.get("/routes");
//     return resRoutes.data as Route[];
//   } catch (error) {
//     console.error("❌ Error en getAllRoutes:", error);
//     return [];
//   }
// }

// /* ================= GET ROUTES BY COMPANY ================= */

// export async function getCompanyRoutes(companyId: string) {
//   const response = await api.get(`/routes/company/${companyId}`);
//   return response.data as Route[];
// }

// /* ================= CREATE ROUTE ================= */

// export async function createRoute(data: {
//   origin: string;
//   destination: string;
//   companyId: string;
// }) {
//   const response = await api.post("/routes", data);
//   return response.data as Route;
// }

// /* ================= TOGGLE ROUTE ACTIVE ================= */

// export async function toggleRouteActive(routeId: string) {
//   const response = await api.patch(`/routes/${routeId}`);
//   return response.data as Route;
// }

// /* ================= DELETE ROUTE ================= */

// export async function deleteRoute(routeId: string) {
//   const response = await api.delete(`/routes/${routeId}`);
//   return response.data;
// }

// /* ================= COMPAT ================= */

// export const routeService = {
//   getAll: getAllRoutes,
//   getCompanyRoutes,
//   create: createRoute,
//   toggleActive: toggleRouteActive,
//   delete: deleteRoute,
// };
