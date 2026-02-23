export type UserRole = "user" | "owner" | "admin" | "super_owner";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string;
  createdAt?: string;
  updatedAt?: string;
  // Profile completion
  phone?: string;
  identificationNumber?: string; // masked
  birthDate?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  isProfileComplete?: boolean;
}
