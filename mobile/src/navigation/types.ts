import { Company } from "../services/company.service";

export type RootTabParamList = {
  Home: undefined;
  History: undefined;
  Profile: undefined;
  Passengers: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;

  Home: undefined;
  Login: undefined;
  Passengers: undefined;
  SettingsModal: undefined;
  Profile: undefined;
  Menu: undefined;
  Balance: undefined;
  MyTickets: undefined;
  ValidateTicket: undefined;
  Terms: undefined; // 👈 Nueva Ruta

  // 🏢 EMPRESAS
  CreateCompany: undefined;
  MyCompanies: undefined;
  CompanyRoutes: {
    companyId: string;
    companyName: string;
  };
  CompanyLegalInfo: {
    company: Company;
  };

  // 🛣️ / 🚍
  AllRoutes: undefined;
  AllTrips: undefined;
  CreateRoute: { companyId: string };
  Trips: { routeId: string; routeName: string; companyName: string };
  CreateTrip: { routeId?: string; routeName?: string };

  // 🎟️ MODALES
  ConfirmTicketModal: {
    tripId: string;
    routeName: string;
    price: number;
    date: string;
    time: string;
  };

  TicketReceiptModal: {
    routeName: string;
    price: number;
    date: string;
    code: string;
  };
};
