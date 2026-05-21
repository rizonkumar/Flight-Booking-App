"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Plane,
  Clock,
  Armchair,
  ArrowLeft,
  Loader2,
  Minus,
  Plus,
  MapPin,
  AlertCircle,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFlight, createBooking } from "@/lib/api";
import type { Flight } from "@/lib/types";
import { formatTime, formatDuration, formatDate } from "@/lib/format";

export default function FlightDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [seats, setSeats] = useState(1);
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("skyroute_user");
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    }
  }, []);

  useEffect(() => {
    if (!params.id) return;
    getFlight(params.id as string)
      .then(setFlight)
      .catch(() => setError("Flight not found"))
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem("skyroute_user");
      setCurrentUser(stored ? JSON.parse(stored) : null);
    };
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  async function handleBook() {
    if (!flight) return;
    if (!currentUser) {
      setBookingError("Please sign in from the top navbar to book this flight.");
      return;
    }
    setBooking(true);
    setBookingError("");
    try {
      const result = await createBooking({
        flightId: flight.id,
        userId: currentUser.id,
        noofSeats: seats,
      });

      const stored = localStorage.getItem("skyroute_bookings");
      const bookings = stored ? JSON.parse(stored) : [];
      bookings.unshift(result);
      localStorage.setItem("skyroute_bookings", JSON.stringify(bookings));

      router.push(`/bookings/${result.id}`);
    } catch {
      setBookingError("Booking failed. Make sure all backend services are running.");
    } finally {
      setBooking(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-forest" />
      </div>
    );
  }

  if (error || !flight) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <Plane className="mx-auto h-10 w-10 text-ink/20" />
        <p className="mt-4 font-display text-lg font-semibold text-ink">
          {error || "Flight not found"}
        </p>
        <Button
          onClick={() => router.back()}
          className="mt-4 bg-forest text-white hover:bg-forest-light"
        >
          Go Back
        </Button>
      </div>
    );
  }

  const departure = new Date(flight.departureTime);
  const arrival = new Date(flight.arrivalTime);
  const durationMs = arrival.getTime() - departure.getTime();
  const totalPrice = flight.price * seats;

  return (
    <div className="bg-secondary min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm text-ink/50 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to results
        </button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="font-display text-2xl font-bold text-ink">
                    {flight.flightNumber}
                  </h1>
                  <p className="mt-1 text-sm text-ink/50">
                    {formatDate(departure)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-mint/30 px-3 py-1.5">
                  <Armchair className="h-3.5 w-3.5 text-forest" />
                  <span
                    className={`text-xs font-medium ${
                      flight.totalSeats <= 5 ? "text-red-500" : "text-forest"
                    }`}
                  >
                    {flight.totalSeats} seats available
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-secondary p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display text-3xl font-bold text-ink">
                      {formatTime(departure)}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-forest">
                      {flight.departureAirportId}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-ink/40">
                      <MapPin className="h-3 w-3" />
                      Departure
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col items-center px-4 pt-2">
                    <div className="flex items-center gap-1.5 text-sm text-ink/50">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDuration(durationMs)}
                    </div>
                    <div className="relative my-3 flex w-full items-center">
                      <div className="h-px flex-1 border-t border-dashed border-ink/20" />
                      <div className="mx-3 flex h-8 w-8 items-center justify-center rounded-full border border-forest/20 bg-white">
                        <Plane className="h-4 w-4 text-forest" />
                      </div>
                      <div className="h-px flex-1 border-t border-dashed border-ink/20" />
                    </div>
                    <p className="text-xs text-ink/40">Direct</p>
                  </div>

                  <div className="text-right">
                    <p className="font-display text-3xl font-bold text-ink">
                      {formatTime(arrival)}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-forest">
                      {flight.arrivalAirportId}
                    </p>
                    <div className="mt-2 flex items-center justify-end gap-1 text-xs text-ink/40">
                      <MapPin className="h-3 w-3" />
                      Arrival
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: "Flight", value: flight.flightNumber },
                  { label: "Duration", value: formatDuration(durationMs) },
                  { label: "Gate", value: flight.boardingGate || "TBA" },
                  {
                    label: "Price",
                    value: `INR ${flight.price.toLocaleString()}`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-border p-3"
                  >
                    <p className="text-xs text-ink/40">{item.label}</p>
                    <p className="mt-1 font-display text-sm font-bold text-ink">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-border bg-white p-6">
              <h2 className="font-display text-lg font-bold text-ink">
                Book this flight
              </h2>

              <div className="mt-5">
                <label className="text-xs font-medium uppercase tracking-wider text-ink/50">
                  Number of Seats
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={() => setSeats(Math.max(1, seats - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-ink/50 transition-colors hover:border-forest hover:text-forest"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-display text-xl font-bold text-ink">
                    {seats}
                  </span>
                  <button
                    onClick={() =>
                      setSeats(Math.min(flight.totalSeats, seats + 1))
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-ink/50 transition-colors hover:border-forest hover:text-forest"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-3 border-t border-border pt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink/50">
                    INR {flight.price.toLocaleString()} x {seats} seat
                    {seats > 1 ? "s" : ""}
                  </span>
                  <span className="font-medium text-ink">
                    INR {totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-dashed border-border pt-3">
                  <span className="font-display text-sm font-bold text-ink">
                    Total
                  </span>
                  <span className="font-display text-2xl font-bold text-ink">
                    INR {totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {bookingError && (
                <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200/50">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                  <span>{bookingError}</span>
                </div>
              )}

              {!currentUser ? (
                <div className="mt-5 rounded-xl bg-slate-50 border border-border p-4 text-center">
                  <p className="text-xs text-ink/60 mb-3">
                    Sign in to secure your reservation and unlock premium tools.
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-forest uppercase tracking-wider">
                    <UserCheck className="h-4 w-4" />
                    Sign In From Top Navigation
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleBook}
                  disabled={booking || flight.totalSeats === 0}
                  className="mt-5 h-12 w-full rounded-lg bg-forest text-sm font-semibold text-white transition-colors hover:bg-forest-light disabled:opacity-50"
                >
                  {booking ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {booking ? "Booking..." : "Confirm Booking"}
                </Button>
              )}

              <p className="mt-3 text-center text-xs text-ink/40">
                You can pay after booking is confirmed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
