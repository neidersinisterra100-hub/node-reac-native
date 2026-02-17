import { Company } from "../services/company.service";
import { Trip } from "../services/trip.service";

/* ===========================
   TABS
=========================== */
export type RootTabParamList = {
  Home: undefined;
  History: undefined;
  Profile: undefined;
  Passengers: undefined;
};

/* ===========================
   STACK
=========================== */
export type RootStackParamList = {
  /* ---------- CORE ---------- */
  Tabs: undefined;
  Login: undefined;
  Register: undefined;
  Terms: undefined;
  Home: undefined;

  /* ---------- USER ---------- */
  Profile: undefined;
  Menu: undefined;
  Balance: undefined;
  Calendar: undefined;
  Reports: undefined;
  Passengers: undefined;
  SettingsModal: undefined;

  /* ---------- BOOKING ---------- */
  LocationSelection: undefined;

  AllTrips:
    | {
        origin?: string;
        destination?: string;
      }
    | undefined;

  TripDetails: {
    tripId: string;
    trip?: Trip;
  };

  SeatSelection: {
    tripId: string;
    routeName: string;
    price: number;
    date: string;
    time: string;
    capacity?: number;
    soldSeats?: number;
    isActive?: boolean;
  };

  Payment: {
    tripId: string;
    seatNumber: number;
  };

  TripSeats: {
    tripId: string;
  };

  ConfirmTicketModal: {
    tripId: string;
    routeName: string;
    price: number;
    date: string;
    time: string;
    seatNumber?: number;
  };

  Ticket: {
    ticketId: string;
    seatNumber: number;
    transactionId?: string;
  };

  /* ---------- USER HISTORY ---------- */
  MyTickets: undefined;

  TicketDetail: {
    ticketId: string;
    seatNumber: number;
    transactionId?: string;
  };

  /* ---------- COMPANY / OWNER ---------- */
  CompanyDashboard: undefined;
  CreateCompany: undefined;
  ManageLocations: undefined;
  MyCompanies: undefined;

  CompanyRoutes: {
    companyId: string;
    companyName: string;
  };

  Trips: {
    routeId: string;
    routeName: string;
    companyName: string;
    routeActive?: boolean;
    companyActive?: boolean;
  };

  CreateRoute: {
    companyId: string;
  };

  CreateTrip: {
    routeId?: string;
    routeName?: string;
  };

  CompanyLegalInfo: {
    company: Company;
  };

  AllRoutes: undefined;

  TicketReceiptModal: {
    routeName: string;
    price: number;
    date: string;
    code: string;
  };

  ValidateTicket: undefined;
};




// import { Company } from "../services/company.service";
// import { Trip } from "../services/trip.service";

// /* ===========================
//    TABS
// =========================== */
// export type RootTabParamList = {
//   Home: undefined;
//   History: undefined;
//   Profile: undefined;
//   Passengers: undefined;
// };

// /* ===========================
//    STACK
// =========================== */
// export type RootStackParamList = {
//   /* ---------- CORE ---------- */
//   Tabs: undefined;
//   Login: undefined;
//   Register: undefined;
//   Terms: undefined;
//   Home: undefined;

//   /* ---------- USER ---------- */
//   Profile: undefined;
//   Menu: undefined;
//   Balance: undefined;
//   Calendar: undefined;
//   Reports: undefined;
//   Passengers: undefined;
//   SettingsModal: undefined;

//   /* ---------- BOOKING (NUEVO FLUJO) ---------- */
//   LocationSelection: undefined;

//   AllTrips:
//     | {
//         origin?: string;
//         destination?: string;
//       }
//     | undefined;

//   TripDetails: {
//     tripId: string;
//     trip?: Trip;
//   };

// SeatSelection: {
//   tripId: string;
//   routeName: string;
//   price: number;
//   date: string;
//   time: string;

//   // 🔐 BLOQUEO POR CAPACIDAD
//   capacity: number;
//   soldSeats: number;
//   isActive: boolean;
// };


//   // Payment: {
//   //   tripId: string;
//   //   seatNumber: number;
//   // };

//   Ticket: {
//     ticketId: string;
//     seatNumber: number;
//     transactionId?: string;
//   };

//   /* ---------- USER HISTORY ---------- */
//   MyTickets: undefined;

//   TicketDetail: {
//     ticketId: string;
//     seatNumber: number;
//     transactionId?: string;
//   };

//   /* ---------- COMPANY / OWNER ---------- */
//   CompanyDashboard: undefined;

//   CreateCompany: undefined;
//   ManageLocations: undefined;
//   MyCompanies: undefined;

//   CompanyRoutes: {
//     companyId: string;
//     companyName: string;
//   };

//   Trips: {
//     routeId: string;
//     routeName: string;
//     companyName: string;
//     routeActive?: boolean;
//     companyActive?: boolean;
//   };

//   CreateRoute: {
//     companyId: string;
//   };

//   CreateTrip: {
//     routeId?: string;
//     routeName?: string;
//   };

//   CompanyLegalInfo: {
//     company: Company;
//   };

//   AllRoutes: undefined;

//   /* ---------- LEGACY (NO BORRAR AÚN) ---------- */
//   ConfirmTicketModal: {
//     tripId: string;
//     routeName: string;
//     price: number;
//     date: string;
//     time: string;
//     // seatNumber?: string;
//     seatNumber?: number;
//   };

//   TicketReceiptModal: {
//     routeName: string;
//     price: number;
//     date: string;
//     code: string;
//   };

//   ValidateTicket: undefined;
// };
