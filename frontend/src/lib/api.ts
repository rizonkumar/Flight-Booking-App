import axios from "axios";
import type {
  Flight,
  Airport,
  City,
  Booking,
  ApiResponse,
  FlightSearchParams,
  SignupPayload,
  SigninPayload,
  AuthResponse,
  CancelBookingResponse,
} from "./types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:6000",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("skyroute_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const { data } = await api.post<ApiResponse<AuthResponse>>("/api/v1/auth/signup", payload);
  return data.data;
}

export async function signin(payload: SigninPayload): Promise<AuthResponse> {
  const { data } = await api.post<ApiResponse<AuthResponse>>("/api/v1/auth/signin", payload);
  return data.data;
}

export async function getFlights(params?: FlightSearchParams): Promise<Flight[]> {
  const { data } = await api.get<ApiResponse<Flight[]>>("/api/v1/flights", { params });
  return data.data;
}

export async function getFlight(id: string): Promise<Flight> {
  const { data } = await api.get<ApiResponse<Flight>>(`/api/v1/flights/${id}`);
  return data.data;
}

export async function getAirports(): Promise<Airport[]> {
  const { data } = await api.get<ApiResponse<Airport[]>>("/api/v1/airports");
  return data.data;
}

export async function getCities(): Promise<City[]> {
  const { data } = await api.get<ApiResponse<City[]>>("/api/v1/cities");
  return data.data;
}

export async function createBooking(payload: {
  flightId: number;
  userId: number;
  noofSeats: number;
}): Promise<Booking> {
  const { data } = await api.post<ApiResponse<Booking>>("/api/v1/bookings", payload);
  return data.data;
}

export async function makePayment(payload: {
  bookingId: number;
  userId: number;
  totalCost: number;
}): Promise<void> {
  await api.post("/api/v1/bookings/payments", payload);
}

export async function cancelBooking(id: number): Promise<CancelBookingResponse> {
  const { data } = await api.patch<ApiResponse<CancelBookingResponse>>(`/api/v1/bookings/${id}/cancel`);
  return data.data;
}

export async function downloadTicket(id: number): Promise<Blob> {
  const { data } = await api.get(`/api/v1/bookings/${id}/ticket`, {
    responseType: "blob",
  });
  return data;
}
