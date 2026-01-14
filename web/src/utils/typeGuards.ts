import { RouteRef } from '../types/trip';
import { Company } from '../services/company.service';

export function isPopulatedRoute(
  route: RouteRef | null
): route is { _id: string } {
  return typeof route === "object" && route !== null && "_id" in route;
}

export function isPopulatedCompany(
  company: { _id: string; name: string; active?: boolean } | string | undefined | Company
): company is Company {
  return typeof company === "object" && company !== null && "_id" in company;
}
