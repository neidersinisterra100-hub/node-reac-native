import { api } from "./api";

export interface Route {
  _id: string;
  origin: string;
  destination: string;
  company: string;
}

/* ================= GET ROUTES BY COMPANY ================= */

export async function getCompanyRoutes(companyId: string) {
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
  const response = await api.post("/routes", data);
  return response.data;
}
