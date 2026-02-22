export type UserRole = "user" | "admin" | "owner" | "super_owner" | "driver";

export interface JwtPayload {
  id: string;
  role: UserRole;
  companyId?: string;
}
