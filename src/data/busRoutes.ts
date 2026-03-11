export interface BusRoute {
  id: string;
  name: string;
  stops: number;
  nextArrival: string;
}

export function getBusRoutes(): BusRoute[] {
  return [];
}
