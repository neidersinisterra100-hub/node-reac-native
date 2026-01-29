export type UserRole = "user" | "admin" | "owner" | "super_owner";

export interface JwtPayload {
  id: string;
  role: UserRole;
  companyId?: string;
}
