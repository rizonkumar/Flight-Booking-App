"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plane, Search } from "lucide-react";
import Link from "next/link";
import { BookingCard } from "@/components/booking-card";
import type { Booking } from "@/lib/types";

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("skyroute_token");
    if (!token) {
      router.push("/");
      return;
    }
    const stored = localStorage.getItem("skyroute_bookings");
    if (stored) {
      setBookings(JSON.parse(stored));
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Plane className="h-8 w-8 animate-spin text-forest" />
      </div>
    );
  }

  return (
    <div className="bg-secondary min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-ink">
            My Bookings
          </h1>
          <p className="mt-2 text-sm text-ink/50">
            View and manage your flight bookings
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-border bg-white p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint/30">
              <Plane className="h-7 w-7 text-forest" />
            </div>
            <p className="mt-5 font-display text-lg font-semibold text-ink">
              No bookings yet
            </p>
            <p className="mt-2 text-sm text-ink/50">
              Search for flights and make your first booking
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-forest px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-light"
            >
              <Search className="h-4 w-4" />
              Search Flights
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
