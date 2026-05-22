"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRightLeft, Users, Calendar, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAirports } from "@/lib/api";
import type { Airport } from "@/lib/types";

const COUNTRY_CODES: Record<string, string> = {
  "United States": "USA",
  Canada: "CAN",
  Mexico: "MEX",
  Brazil: "BRA",
  Argentina: "ARG",
  "United Kingdom": "GBR",
  France: "FRA",
  Germany: "DEU",
  Spain: "ESP",
  Italy: "ITA",
  Netherlands: "NLD",
  Switzerland: "CHE",
  Sweden: "SWE",
  Norway: "NOR",
  "United Arab Emirates": "ARE",
  Qatar: "QAT",
  "Saudi Arabia": "SAU",
  India: "IND",
  Singapore: "SGP",
  Malaysia: "MYS",
  Thailand: "THA",
  Japan: "JPN",
  "South Korea": "KOR",
  China: "CHN",
  Australia: "AUS",
  "New Zealand": "NZL",
  "South Africa": "ZAF",
  Kenya: "KEN",
  Egypt: "EGY",
  Turkey: "TUR",
};

interface SearchFormProps {
  defaultOrigin?: string;
  defaultDestination?: string;
  defaultDate?: string;
  defaultPassengers?: string;
  compact?: boolean;
}

export function SearchForm({
  defaultOrigin = "",
  defaultDestination = "",
  defaultDate = "",
  defaultPassengers = "1",
  compact = false,
}: SearchFormProps) {
  const router = useRouter();
  const [airports, setAirports] = useState<Airport[]>([]);
  const [origin, setOrigin] = useState(defaultOrigin);
  const [destination, setDestination] = useState(defaultDestination);
  const [date, setDate] = useState(defaultDate);
  const [passengers, setPassengers] = useState(defaultPassengers);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAirports()
      .then(setAirports)
      .catch(() => setAirports([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      if (origin) {
        const originAirport = airports.find((a) => a.code === origin);
        const countryName = originAirport?.City?.name
          ? originAirport.City.name.split(", ").pop()
          : "";
        if (!countryName || COUNTRY_CODES[countryName] !== selectedCountry) {
          setOrigin("");
        }
      }
      if (destination) {
        const destAirport = airports.find((a) => a.code === destination);
        const countryName = destAirport?.City?.name
          ? destAirport.City.name.split(", ").pop()
          : "";
        if (!countryName || COUNTRY_CODES[countryName] !== selectedCountry) {
          setDestination("");
        }
      }
    }
  }, [selectedCountry, airports]);

  const availableCountries = Array.from(
    new Set(
      airports
        .map((a) => {
          const countryName = a.City?.name ? a.City.name.split(", ").pop() : "";
          return countryName && COUNTRY_CODES[countryName] ? countryName : "";
        })
        .filter(Boolean),
    ),
  ).sort();

  const filteredAirports = selectedCountry
    ? airports.filter((a) => {
        const countryName = a.City?.name ? a.City.name.split(", ").pop() : "";
        return countryName && COUNTRY_CODES[countryName] === selectedCountry;
      })
    : airports;

  function handleSwap() {
    setOrigin(destination);
    setDestination(origin);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (origin && destination) {
      params.set("trips", `${origin}-${destination}`);
    }
    if (date) params.set("tripDate", date);
    if (passengers) params.set("travellers", passengers);
    router.push(`/flights?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-5 flex flex-wrap items-center gap-2.5 border-b border-border/50 pb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-ink/40 flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-forest" />
          Country Filter
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCountry("")}
            className={`h-8 px-3.5 text-xs font-semibold rounded-full border transition-all ${
              selectedCountry === ""
                ? "bg-forest border-forest text-white shadow-sm"
                : "bg-secondary border-border text-ink/70 hover:border-forest/30 hover:bg-white"
            }`}
          >
            All
          </button>
          {[
            "India",
            "United States",
            "United Kingdom",
            "Canada",
            "Singapore",
          ].map((c) => {
            const code = COUNTRY_CODES[c];
            if (!code) return null;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCountry(code)}
                className={`h-8 px-3.5 text-xs font-semibold rounded-full border transition-all ${
                  selectedCountry === code
                    ? "bg-forest border-forest text-white shadow-sm"
                    : "bg-secondary border-border text-ink/70 hover:border-forest/30 hover:bg-white"
                }`}
              >
                {c} ({code})
              </button>
            );
          })}

          <select
            value={
              ["IND", "USA", "GBR", "CAN", "SGP"].includes(selectedCountry) ||
              selectedCountry === ""
                ? ""
                : selectedCountry
            }
            onChange={(e) => {
              if (e.target.value) {
                setSelectedCountry(e.target.value);
              }
            }}
            className="h-8 rounded-full border border-border bg-secondary px-3 text-xs font-semibold text-ink/70 outline-none transition-all hover:border-forest/30 focus:border-forest focus:ring-1 focus:ring-forest/20"
          >
            <option value="">More Countries...</option>
            {availableCountries
              .filter(
                (c) =>
                  ![
                    "India",
                    "United States",
                    "United Kingdom",
                    "Canada",
                    "Singapore",
                  ].includes(c),
              )
              .map((c) => (
                <option key={c} value={COUNTRY_CODES[c]}>
                  {c} ({COUNTRY_CODES[c]})
                </option>
              ))}
          </select>
        </div>
      </div>

      <div
        className={
          compact
            ? "flex flex-col gap-3 sm:flex-row sm:items-end"
            : "flex flex-col gap-4"
        }
      >
        <div
          className={
            compact
              ? "flex flex-1 flex-col gap-3 sm:flex-row"
              : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          }
        >
          <div className="relative flex-1">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink/50">
              From
            </label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="h-12 w-full appearance-none rounded-lg border border-border bg-white px-4 text-sm font-medium text-ink outline-none transition-colors focus:border-forest focus:ring-2 focus:ring-forest/20"
            >
              <option value="">Select origin</option>
              {filteredAirports.map((a) => (
                <option key={a.id} value={a.code}>
                  {a.code} — {a.name}
                </option>
              ))}
            </select>
          </div>

          {!compact && (
            <div className="flex items-end justify-center sm:pb-1">
              <button
                type="button"
                onClick={handleSwap}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink/40 transition-colors hover:border-forest hover:text-forest"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className={compact ? "flex-1" : ""}>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink/50">
              To
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="h-12 w-full appearance-none rounded-lg border border-border bg-white px-4 text-sm font-medium text-ink outline-none transition-colors focus:border-forest focus:ring-2 focus:ring-forest/20"
            >
              <option value="">Select destination</option>
              {filteredAirports.map((a) => (
                <option key={a.id} value={a.code}>
                  {a.code} — {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className={compact ? "flex-1" : ""}>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink/50">
              <Calendar className="mr-1 inline h-3 w-3" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-12 w-full rounded-lg border border-border bg-white px-4 text-sm font-medium text-ink outline-none transition-colors focus:border-forest focus:ring-2 focus:ring-forest/20"
            />
          </div>

          <div className={compact ? "w-24" : ""}>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink/50">
              <Users className="mr-1 inline h-3 w-3" />
              Passengers
            </label>
            <select
              value={passengers}
              onChange={(e) => setPassengers(e.target.value)}
              className="h-12 w-full appearance-none rounded-lg border border-border bg-white px-4 text-sm font-medium text-ink outline-none transition-colors focus:border-forest focus:ring-2 focus:ring-forest/20"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-12 rounded-lg bg-forest px-8 text-sm font-semibold text-white transition-colors hover:bg-forest-light disabled:opacity-50"
        >
          <Search className="mr-2 h-4 w-4" />
          Search Flights
        </Button>
      </div>
    </form>
  );
}
