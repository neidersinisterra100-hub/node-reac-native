import { api } from "./api";

/* ================= TYPES ================= */

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

/* ================= CREATE COMPANY (OWNER) ================= */
export async function createCompany(data: CreateCompanyInput) {
  const response = await api.post("/companies", data);
  return response.data as Company;
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
