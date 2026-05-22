import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plane, Clock, Armchair } from "lucide-react";
import type { Flight } from "@/lib/types";
import { formatDuration, formatTime } from "@/lib/format";

interface FlightCardProps {
  flight: Flight;
}

export function FlightCard({ flight }: FlightCardProps) {
  const departure = new Date(flight.departureTime);
  const arrival = new Date(flight.arrivalTime);
  const durationMs = arrival.getTime() - departure.getTime();
  const searchParams = useSearchParams();
  const queryString = searchParams?.toString();
  const href = queryString ? `/flights/${flight.id}?${queryString}` : `/flights/${flight.id}`;

  return (
    <Link href={href}>
      <div className="group rounded-xl border border-border bg-white p-5 transition-all hover:border-forest/30 hover:shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-4 sm:gap-6">
            {/* Departure */}
            <div className="text-center sm:text-left">
              <p className="font-display text-2xl font-bold text-ink">
                {formatTime(departure)}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-forest">
                {flight.departureAirportId}
              </p>
            </div>

            {/* Route line */}
            <div className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex items-center gap-1 text-xs text-ink/40">
                <Clock className="h-3 w-3" />
                {formatDuration(durationMs)}
              </div>
              <div className="relative flex w-full items-center">
                <div className="h-px flex-1 bg-border" />
                <Plane className="mx-2 h-3.5 w-3.5 text-forest" />
                <div className="h-px flex-1 bg-border" />
              </div>
              <p className="text-xs text-ink/40">{flight.flightNumber}</p>
            </div>

            {/* Arrival */}
            <div className="text-center sm:text-right">
              <p className="font-display text-2xl font-bold text-ink">
                {formatTime(arrival)}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-forest">
                {flight.arrivalAirportId}
              </p>
            </div>
          </div>

          {/* Price & Seats */}
          <div className="flex items-center justify-between border-t border-border pt-4 sm:ml-6 sm:flex-col sm:items-end sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
            <div className="text-right">
              <p className="font-display text-2xl font-bold text-ink">
                <span className="text-base font-normal text-ink/50">INR </span>
                {flight.price.toLocaleString()}
              </p>
              <p className="text-xs text-ink/40">per person</p>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <Armchair className="h-3.5 w-3.5 text-forest-light" />
              <span
                className={`text-xs font-medium ${
                  flight.totalSeats <= 5
                    ? "text-red-500"
                    : "text-forest-light"
                }`}
              >
                {flight.totalSeats} seats left
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
