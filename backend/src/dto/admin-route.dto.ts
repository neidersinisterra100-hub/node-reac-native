// src/dto/admin-route.dto.ts
export interface AdminRouteDTO {
  id: string;
  origin: string;
  destination: string;
  companyId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
