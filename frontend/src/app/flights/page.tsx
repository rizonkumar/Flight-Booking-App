"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, SlidersHorizontal, ArrowUpDown, Plane } from "lucide-react";
import { SearchForm } from "@/components/search-form";
import { FlightCard } from "@/components/flight-card";
import { getFlights } from "@/lib/api";
import type { Flight } from "@/lib/types";

type SortOption = "price_asc" | "price_desc" | "departure_asc" | "departure_desc";

function FlightsContent() {
  const searchParams = useSearchParams();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState<SortOption>("price_asc");
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [priceFilter, setPriceFilter] = useState<number>(0);

  const trips = searchParams.get("trips") || "";
  const tripDate = searchParams.get("tripDate") || "";
  const travellers = searchParams.get("travellers") || "";
  const country = searchParams.get("country") || "";

  const fetchFlights = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params: Record<string, string> = {};
      if (trips) params.trips = trips;
      if (tripDate) params.tripDate = tripDate;
      if (travellers) params.travellers = travellers;
      if (country) params.country = country;

      const data = await getFlights(params);
      setFlights(data);
      if (data.length > 0) {
        const max = Math.max(...data.map((f) => f.price));
        setMaxPrice(max);
        setPriceFilter(max);
      }
    } catch {
      setError("Unable to fetch flights. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, [trips, tripDate, travellers, country]);

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  const sortedFlights = [...flights]
    .filter((f) => f.price <= priceFilter)
    .sort((a, b) => {
      switch (sort) {
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        case "departure_asc":
          return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
        case "departure_desc":
          return new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime();
        default:
          return 0;
      }
    });

  const [origin, destination] = trips.split("-");

  return (
    <div className="bg-secondary min-h-screen">
      {/* Search bar */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <SearchForm
            compact
            defaultOrigin={origin}
            defaultDestination={destination}
            defaultDate={tripDate}
            defaultPassengers={travellers || "1"}
          />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Header + Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">
              {loading
                ? "Searching flights..."
                : `${sortedFlights.length} flight${sortedFlights.length !== 1 ? "s" : ""} found`}
            </h1>
            {trips && (
              <p className="mt-1 text-sm text-ink/50">
                {origin} to {destination}
                {tripDate && ` on ${tripDate}`}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {maxPrice > 0 && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2">
                <SlidersHorizontal className="h-3.5 w-3.5 text-ink/40" />
                <span className="text-xs text-ink/50">Max:</span>
                <input
                  type="range"
                  min={0}
                  max={maxPrice}
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(Number(e.target.value))}
                  className="h-1.5 w-20 cursor-pointer accent-forest sm:w-28"
                />
                <span className="text-xs font-medium text-ink">
                  INR {priceFilter.toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2">
              <ArrowUpDown className="h-3.5 w-3.5 text-ink/40" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="appearance-none bg-transparent text-xs font-medium text-ink outline-none"
              >
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="departure_asc">Departure: Earliest</option>
                <option value="departure_desc">Departure: Latest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-forest" />
            <p className="mt-3 text-sm text-ink/50">Searching for flights...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : sortedFlights.length === 0 ? (
          <div className="rounded-xl border border-border bg-white p-12 text-center">
            <Plane className="mx-auto h-10 w-10 text-ink/20" />
            <p className="mt-4 font-display text-lg font-semibold text-ink">
              No flights found
            </p>
            <p className="mt-1 text-sm text-ink/50">
              Try adjusting your search criteria or filters
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedFlights.map((flight) => (
              <FlightCard key={flight.id} flight={flight} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FlightsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-forest" />
        </div>
      }
    >
      <FlightsContent />
    </Suspense>
  );
}
