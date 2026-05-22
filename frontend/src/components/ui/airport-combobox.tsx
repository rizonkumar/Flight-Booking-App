"use strict";

import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Check, Plane } from "lucide-react";
import type { Airport } from "@/lib/types";

interface AirportComboboxProps {
  airports: Airport[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}

export function AirportCombobox({
  airports,
  value,
  onChange,
  placeholder,
  label,
}: AirportComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedAirport = airports.find((a) => a.code === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = airports.filter((a) => {
    const searchLower = search.toLowerCase();
    const nameMatch = a.name.toLowerCase().includes(searchLower);
    const codeMatch = a.code.toLowerCase().includes(searchLower);
    const cityMatch = a.City?.name?.toLowerCase().includes(searchLower);
    return nameMatch || codeMatch || cityMatch;
  });

  const displayed = filtered.slice(0, 150);

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/50">
        {label}
      </label>

      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch("");
        }}
        className={`flex h-12 w-full items-center justify-between rounded-xl border border-border bg-white px-4 text-left shadow-sm transition-all focus:border-forest focus:ring-2 focus:ring-forest/10 hover:border-forest/30 ${
          isOpen ? "border-forest ring-2 ring-forest/10" : ""
        }`}
      >
        {selectedAirport ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <Plane className="h-4 w-4 shrink-0 text-forest" />
            <div className="flex flex-col text-left leading-tight truncate">
              <span className="text-sm font-semibold text-ink">
                {selectedAirport.City?.name
                  ? selectedAirport.City.name.split(",")[0]
                  : selectedAirport.name}
              </span>
              <span className="text-xxs text-ink/40 truncate">
                {selectedAirport.code} — {selectedAirport.name}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-sm text-ink/40">{placeholder}</span>
        )}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-ink/40 transition-transform duration-200 ${isOpen ? "rotate-180 text-forest" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 max-h-72 w-full overflow-hidden rounded-2xl border border-white/20 bg-white/95 backdrop-blur-xl shadow-2xl animate-in fade-in-0 slide-in-from-top-4 duration-200 flex flex-col">
          <div className="relative border-b border-border p-2 shrink-0">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by city, code, or airport name..."
              className="h-10 w-full rounded-xl bg-secondary pl-9 pr-4 text-xs text-ink outline-none transition-all focus:ring-1 focus:ring-forest/20"
              autoFocus
            />
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden py-1.5 scrollbar-thin scrollbar-thumb-mint scrollbar-track-secondary">
            {displayed.length === 0 ? (
              <div className="py-8 text-center text-xs text-ink/40 flex flex-col items-center justify-center gap-1">
                <Plane className="h-5 w-5 text-ink/20 animate-pulse" />
                <span>No airports found</span>
              </div>
            ) : (
              displayed.map((a) => {
                const isSelected = a.code === value;
                const cityParts = a.City?.name
                  ? a.City.name.split(", ")
                  : [a.name, ""];
                const cityName = cityParts[0];
                const countryName = cityParts[1] || "";

                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      onChange(a.code);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left transition-all hover:bg-mint/10 ${
                      isSelected ? "bg-mint/20" : ""
                    }`}
                  >
                    <div className="flex flex-col gap-0.5 max-w-[80%]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-ink leading-tight">
                          {cityName}
                        </span>
                        {countryName && (
                          <span className="text-xxs font-medium text-ink/40 bg-secondary px-1.5 py-0.5 rounded-full">
                            {countryName}
                          </span>
                        )}
                      </div>
                      <span className="text-xxs text-ink/50 truncate leading-tight">
                        {a.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 items-center justify-center rounded-lg bg-forest/10 px-2 text-xxs font-bold text-forest">
                        {a.code}
                      </span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-forest shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
