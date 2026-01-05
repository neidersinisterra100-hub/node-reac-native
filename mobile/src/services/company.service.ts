import { api } from "./api";

/* ================= TYPES ================= */

export interface Company {
  _id: string;
  name: string;
  owner: string;      // userId (owner)
  balance: number;
  createdAt: string;
  updatedAt: string;
}

/* ================= CREATE COMPANY ================= */
/**
 * Solo OWNER
 */
export async function createCompany(name: string) {
  const response = await api.post("/companies", {
    name,
  });

  return response.data as Company;
}

/* ================= GET MY COMPANIES ================= */
/**
 * Empresas del owner autenticado
 * ⚠️ Requiere backend: GET /companies/my
 */
export async function getMyCompanies() {
  const response = await api.get("/companies/my");
  return response.data as Company[];
}



// import { api } from "./api";

// /* ================= TYPES ================= */

// export interface Company {
//   _id: string;
//   name: string;
//   owner: string;
//   balance: number;
//   createdAt: string;
//   updatedAt: string;
// }

// /* ================= CREATE COMPANY ================= */
// /**
//  * Solo OWNER
//  */
// export async function createCompany(name: string) {
//   const response = await api.post("/companies", {
//     name,
//   });

//   return response.data as Company;
// }

// /* ================= GET MY COMPANIES ================= */
// /**
//  * Empresas del owner autenticado
//  */
// export async function getMyCompanies() {
//   const response = await api.get("/companies/my");
//   return response.data as Company[];
// }
