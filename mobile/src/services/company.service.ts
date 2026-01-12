import { api } from "./api"; // 👈 Corregido import

export interface CompanyCompliance {
    hasLegalConstitution: boolean;
    hasTransportLicense: boolean;
    hasVesselRegistration: boolean;
    hasCrewLicenses: boolean;
    hasInsurance: boolean;
    hasSafetyProtocols: boolean;
}

export interface Company {
  _id: string;
  name: string;
  nit?: string;
  legalRepresentative?: string;
  licenseNumber?: string;
  insurancePolicyNumber?: string;
  owner: string;      // userId (owner)
  balance: number;
  active: boolean;
  isVerified?: boolean;
  compliance?: CompanyCompliance;
  admins?: string[];  // Lista de IDs de admins
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyInput {
  name: string;
  nit?: string;
  legalRepresentative?: string;
  licenseNumber?: string;
  insurancePolicyNumber?: string;
  compliance?: CompanyCompliance;
}

// Nueva interfaz para crear con admin
export interface CreateCompanyWithAdminInput extends CreateCompanyInput {
  adminName?: string;
  adminEmail?: string;
  adminPassword?: string;
}

export interface CompanyAdmin {
    _id: string;
    name: string;
    email: string;
}

/* ================= CREATE COMPANY (OWNER) ================= */

// Crear solo empresa
export async function createCompany(data: CreateCompanyInput) {
  const response = await api.post("/companies", data);
  return response.data as Company;
}

// Crear empresa + admin (Transaccional)
export async function createCompanyWithAdmin(data: CreateCompanyWithAdminInput) {
  const response = await api.post("/companies/with-admin", data);
  return response.data; // Retorna { company, admin, message }
}

/* ================= GET COMPANIES ================= */
export async function getMyCompanies() {
  const response = await api.get("/companies/my");
  return response.data as Company[];
}

export async function getAllCompanies() {
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

/* ================= ADMINS ================= */
// Obtener lista de administradores de una empresa
export async function getCompanyAdmins(companyId: string) {
    const response = await api.get(`/companies/${companyId}/admins`);
    return response.data as CompanyAdmin[];
}


// import { api } from "./api"; // 👈 Corregido import

// export interface CompanyCompliance {
//     hasLegalConstitution: boolean;
//     hasTransportLicense: boolean;
//     hasVesselRegistration: boolean;
//     hasCrewLicenses: boolean;
//     hasInsurance: boolean;
//     hasSafetyProtocols: boolean;
// }

// export interface Company {
//   _id: string;
//   name: string;
//   nit?: string;
//   legalRepresentative?: string;
//   licenseNumber?: string;
//   insurancePolicyNumber?: string;
//   owner: string;      // userId (owner)
//   balance: number;
//   active: boolean;
//   isVerified?: boolean;
//   compliance?: CompanyCompliance;
//   admins?: string[];  // Lista de IDs de admins
//   createdAt: string;
//   updatedAt: string;
// }

// export interface CreateCompanyInput {
//   name: string;
//   nit?: string;
//   legalRepresentative?: string;
//   licenseNumber?: string;
//   insurancePolicyNumber?: string;
//   compliance?: CompanyCompliance;
// }

// // Nueva interfaz para crear con admin
// export interface CreateCompanyWithAdminInput extends CreateCompanyInput {
//   adminName?: string;
//   adminEmail?: string;
//   adminPassword?: string;
// }

// export interface CompanyAdmin {
//     _id: string;
//     name: string;
//     email: string;
// }

// /* ================= CREATE COMPANY (OWNER) ================= */

// // Crear solo empresa
// export async function createCompany(data: CreateCompanyInput) {
//   const response = await api.post("/companies", data);
//   return response.data as Company;
// }

// // Crear empresa + admin (Transaccional)
// export async function createCompanyWithAdmin(data: CreateCompanyWithAdminInput) {
//   const response = await api.post("/companies/with-admin", data);
//   return response.data; // Retorna { company, admin, message }
// }

// /* ================= GET COMPANIES ================= */
// export async function getMyCompanies() {
//   const response = await api.get("/companies/my");
//   return response.data as Company[];
// }

// export async function getAllCompanies() {
//   try {
//       const response = await api.get("/companies");
//       return response.data as Company[];
//   } catch (error) {
//       console.log("Error fetching public companies (endpoint might not exist yet):", error);
//       return [];
//   }
// }

// /* ================= ACTIONS (OWNER) ================= */

// export async function toggleCompanyActive(id: string, active: boolean) {
//     const response = await api.patch(`/companies/${id}`, { active });
//     return response.data;
// }

// export async function deleteCompany(id: string) {
//     const response = await api.delete(`/companies/${id}`);
//     return response.data;
// }

// /* ================= ADMINS ================= */
// // Obtener lista de administradores de una empresa
// export async function getCompanyAdmins(companyId: string) {
//     const response = await api.get(`/companies/${companyId}/admins`);
//     return response.data as CompanyAdmin[];
// }
