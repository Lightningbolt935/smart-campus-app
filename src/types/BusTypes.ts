export interface BusRoute {
  id: string;
  name: string;
  stops: number;
  nextArrival: string;
}

export interface BusSchedule {
  routeId: string;
  departureTime: string;
  arrivalTime: string;
}
