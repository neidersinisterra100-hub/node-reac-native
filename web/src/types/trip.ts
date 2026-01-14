export type RouteRef = 
  | string 
  | { 
      _id: string; 
      origin?: string; 
      destination?: string;
      company?: { _id: string; name: string } | string;
    }; 

export type Trip = { 
  _id: string; 
  route: RouteRef | null; 
  date: string; 
  departureTime: string; 
  price: number; 
  // Fields added to maintain compatibility with existing code
  capacity: number;
  transportType: string;
  active: boolean;
  company?: { _id: string; name: string } | string;
}; 
