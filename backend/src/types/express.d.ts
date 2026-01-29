import type { CompanyDocument } from "../models/company.model";

declare global {
  namespace Express {
    interface Request {
      company?: CompanyDocument;
    }
  }
}
