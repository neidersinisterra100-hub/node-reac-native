import "express";

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      role?: "user" | "admin" | "owner";
    }

    interface Request {
      user?: UserPayload;
    }
  }
}



// import "express";

// declare global {
//   namespace Express {
//     interface User {
//       id: string;
//       role: string;
//     }

//     interface Request {
//       user?: User;
//     }
//   }
// }
