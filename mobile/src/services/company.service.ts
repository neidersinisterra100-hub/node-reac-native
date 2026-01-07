import { api } from "./api";

/* ================= TYPES ================= */

export interface Company {
  _id: string;
  name: string;
  owner: string;      // userId (owner)
  balance: number;
  active: boolean;    // ✅ Añadido
  createdAt: string;
  updatedAt: string;
}

/* ================= CREATE COMPANY (OWNER) ================= */
export async function createCompany(name: string) {
  const response = await api.post("/companies", {
    name,
  });
  return response.data as Company;
}

/* ================= GET COMPANIES ================= */
/**
 * Si es Owner/Admin -> /companies/my (sus empresas)
 * Si es User -> /companies (todas las públicas, si existe endpoint)
 * 
 * Por ahora, usaremos getMyCompanies para owner y simularemos publicas si falla.
 */
export async function getMyCompanies() {
  const response = await api.get("/companies/my");
  return response.data as Company[];
}

export async function getAllCompanies() {
  // Intentamos obtener públicas. Si falla, retornamos array vacío.
  try {
      const response = await api.get("/companies");
      return response.data as Company[];
  } catch (error) {
      console.log("Error fetching public companies (endpoint might not exist yet):", error);
      return [];
  }
}

/* ================= ACTIONS (OWNER) ================= */

export async function toggleCompanyActive(id: string, active: boolean) {
    const response = await api.patch(`/companies/${id}`, { active });
    return response.data;
}

export async function deleteCompany(id: string) {
    const response = await api.delete(`/companies/${id}`);
    return response.data;
}
