import { api } from "./api";

/* ================= TYPES ================= */

export interface Route {
  _id: string;
  origin: string;
  destination: string;
  company: string;
  active: boolean;
}

/* ================= GET ROUTES BY COMPANY ================= */

export async function getCompanyRoutes(companyId: string) {
  const response = await api.get(`/routes/company/${companyId}`);
  return response.data as Route[];
}

/* ================= CREATE ROUTE ================= */

export async function createRoute(data: {
  origin: string;
  destination: string;
  companyId: string;
}) {
  const response = await api.post("/routes", data);
  return response.data as Route;
}

/* ================= TOGGLE ROUTE ACTIVE ================= */

export async function toggleRouteActive(routeId: string) {
  // En backend local es PATCH /routes/:id con body { active: boolean }
  // Pero el controlador hace toggle automático si no se envía body, o el endpoint es simple.
  // Revisando backend: router.patch("/:routeId", requireAuth, toggleRouteActive) -> trip.active = !trip.active
  // Así que no necesita body, solo la llamada.
  const response = await api.patch(`/routes/${routeId}`);
  return response.data as Route;
}

/* ================= DELETE ROUTE ================= */

export async function deleteRoute(routeId: string) {
  const response = await api.delete(`/routes/${routeId}`);
  return response.data;
}
