// src/dto/admin-trip.dto.ts
export interface AdminTripDTO {
  id: string;
  routeId: string;
  companyId: string;
  date: string;
  departureTime: string;
  price: number;
  capacity: number;
  transportType: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
