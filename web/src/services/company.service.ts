import api from '../lib/axios';

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
  owner: string;
  balance: number;
  active: boolean;
  isVerified?: boolean;
  compliance?: CompanyCompliance;
  admins?: string[];
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

/* ================= EXPORTED FUNCTIONS (Named Exports) ================= */

export async function createCompany(data: CreateCompanyInput) {
  const response = await api.post("/companies", data);
  return response.data as Company;
}

export async function createCompanyWithAdmin(data: CreateCompanyWithAdminInput) {
  const response = await api.post("/companies/with-admin", data);
  return response.data;
}

export async function getMyCompanies() {
  const response = await api.get("/companies/my");
  return response.data as Company[];
}

export async function getAllCompanies() {
  try {
    const response = await api.get("/companies");
    return response.data as Company[];
  } catch (error) {
    console.log("Error fetching public companies:", error);
    return [];
  }
}

export async function toggleCompanyActive(id: string, active: boolean) {
  const response = await api.patch(`/companies/${id}`, { active });
  return response.data;
}

export async function deleteCompany(id: string) {
  const response = await api.delete(`/companies/${id}`);
  return response.data;
}

export async function getCompanyAdmins(companyId: string) {
  const response = await api.get(`/companies/${companyId}/admins`);
  return response.data as CompanyAdmin[];
}

/* ================= COMPATIBILITY OBJECT (Default/Named Export) ================= */

export const companyService = {
  create: createCompany,
  createCompany: createCompany,
  createCompanyWithAdmin: createCompanyWithAdmin,
  getAll: getMyCompanies,      // Alias common used name
  getMyCompanies: getMyCompanies,
  getPublic: getAllCompanies,
  toggleActive: toggleCompanyActive,
  toggleCompanyActive: toggleCompanyActive,
  delete: deleteCompany,
  deleteCompany: deleteCompany,
  getAdmins: getCompanyAdmins,
  getCompanyAdmins: getCompanyAdmins
};
