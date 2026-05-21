export interface Airport {
  id: number;
  name: string;
  code: string;
  address: string;
  cityId: number;
  createdAt: string;
  updatedAt: string;
  City?: City;
}

export interface City {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Airplane {
  id: number;
  modelNumber: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Flight {
  id: number;
  flightNumber: string;
  airplaneId: number;
  departureAirportId: string;
  arrivalAirportId: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  boardingGate?: string;
  totalSeats: number;
  createdAt: string;
  updatedAt: string;
  Airplane?: Airplane;
  departureAirport?: Airport;
  arrivalAirport?: Airport;
}

export interface Booking {
  id: number;
  flightId: number;
  userId: number;
  status: "initiated" | "pending" | "booked" | "cancelled";
  noOfSeats: number;
  totalCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
  role: "admin" | "customer";
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface SigninPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
}

export interface CancelBookingResponse {
  bookingId: number;
  status: "cancelled";
  totalCost: number;
  refundPercent: string;
  refundAmount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error: Record<string, unknown>;
}

export interface FlightSearchParams {
  trips?: string;
  price?: string;
  travellers?: string;
  tripDate?: string;
  sort?: string;
}

