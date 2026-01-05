import { api } from "./api";

/* ================= TYPES ================= */

export interface Route {
  _id: string;
  origin: string;
  destination: string;
  company: string;
  active: boolean; // 👈 necesario para el toggle
}

/* ================= GET ROUTES BY COMPANY ================= */

export async function getCompanyRoutes(
  companyId: string
) {
  const response = await api.get(
    `/routes/company/${companyId}`
  );

  return response.data as Route[];
}

/* ================= CREATE ROUTE ================= */

export async function createRoute(data: {
  origin: string;
  destination: string;
  companyId: string;
}) {
  const response = await api.post(
    "/routes",
    data
  );

  return response.data as Route;
}

/* ================= TOGGLE ROUTE ACTIVE ================= */
/**
 * Solo OWNER
 * Cambia active → true / false
 */
export async function toggleRouteActive(
  routeId: string
) {
  const response = await api.patch(
    `/routes/${routeId}/toggle`
  );

  return response.data as Route;
}



// import { api } from "./api";

// export interface Route {
//   _id: string;
//   origin: string;
//   destination: string;
//   company: string;
// }

// /* ================= GET ROUTES BY COMPANY ================= */

// export async function getCompanyRoutes(companyId: string) {
//   const response = await api.get(
//     `/routes/company/${companyId}`
//   );
//   return response.data as Route[];
// }

// /* ================= CREATE ROUTE ================= */

// export async function createRoute(data: {
//   origin: string;
//   destination: string;
//   companyId: string;
// }) {
//   const response = await api.post("/routes", data);
//   return response.data;
// }
