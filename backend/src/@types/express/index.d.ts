import "express";
import type { CompanyDocument } from "../../models/company.model";

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      role: "user" | "admin" | "owner" | "super_owner";
      companyId?: string;
    }

    interface Request {
      user?: UserPayload;
      company?: CompanyDocument;
    }
  }
}

export {};

// import type { CompanyDocument } from "../../models/company.model";
// import type { UserDocument } from "../../models/user.model";

// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         id: string;
//         role: "owner" | "admin" | "staff" | "user";
//         companyId?: string;
//       };
//       company?: CompanyDocument;
//     }
//   }
// }

// export {};
