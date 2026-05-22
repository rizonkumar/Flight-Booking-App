"use client";

import { useState, useEffect, useRef } from "react";
import { Users, Minus, Plus, ChevronDown } from "lucide-react";

interface PassengersSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export function PassengersSelector({
  value,
  onChange,
  label,
}: PassengersSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalFromParent = parseInt(value, 10) || 1;

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  useEffect(() => {
    const totalInternal = adults + children + infants;
    if (totalFromParent !== totalInternal) {
      setAdults(Math.max(1, totalFromParent));
      setChildren(0);
      setInfants(0);
    }
  }, [totalFromParent]);

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
  }, [adults, children, infants]);

  const updateParentValue = (
    newAdults: number,
    newChildren: number,
    newInfants: number,
  ) => {
    const sum = newAdults + newChildren + newInfants;
    onChange(String(sum));
  };

  const incrementAdults = () => {
    const newVal = adults + 1;
    setAdults(newVal);
    updateParentValue(newVal, children, infants);
  };

  const decrementAdults = () => {
    if (adults > 1) {
      const newVal = adults - 1;
      setAdults(newVal);
      updateParentValue(newVal, children, infants);
    }
  };

  const incrementChildren = () => {
    const newVal = children + 1;
    setChildren(newVal);
    updateParentValue(adults, newVal, infants);
  };

  const decrementChildren = () => {
    if (children > 0) {
      const newVal = children - 1;
      setChildren(newVal);
      updateParentValue(adults, newVal, infants);
    }
  };

  const incrementInfants = () => {
    const newVal = infants + 1;
    setInfants(newVal);
    updateParentValue(adults, children, newVal);
  };

  const decrementInfants = () => {
    if (infants > 0) {
      const newVal = infants - 1;
      setInfants(newVal);
      updateParentValue(adults, children, newVal);
    }
  };

  const displayLabel = () => {
    const sum = totalFromParent;
    return `${sum} Passenger${sum > 1 ? "s" : ""}`;
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/50">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-12 w-full items-center justify-between rounded-xl border border-border bg-white px-4 text-left shadow-sm transition-all focus:border-forest focus:ring-2 focus:ring-forest/10 hover:border-forest/30 ${
          isOpen ? "border-forest ring-2 ring-forest/10" : ""
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <Users className="h-4 w-4 shrink-0 text-forest" />
          <span className="text-sm font-semibold text-ink leading-tight truncate">
            {displayLabel()}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-ink/40 transition-transform duration-200 ${isOpen ? "rotate-180 text-forest" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-white/20 bg-white/95 backdrop-blur-xl p-5 shadow-2xl animate-in fade-in-0 slide-in-from-top-4 duration-200 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-ink leading-tight">
                Adults
              </span>
              <span className="text-xxs text-ink/40">Ages 12 or above</span>
            </div>
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={decrementAdults}
                disabled={adults <= 1}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-secondary hover:border-forest/40 hover:bg-white text-ink/60 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-4 text-center text-sm font-bold text-ink">
                {adults}
              </span>
              <button
                type="button"
                onClick={incrementAdults}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-secondary hover:border-forest/40 hover:bg-white text-ink/60 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-ink leading-tight">
                Children
              </span>
              <span className="text-xxs text-ink/40">Ages 2-11</span>
            </div>
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={decrementChildren}
                disabled={children <= 0}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-secondary hover:border-forest/40 hover:bg-white text-ink/60 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-4 text-center text-sm font-bold text-ink">
                {children}
              </span>
              <button
                type="button"
                onClick={incrementChildren}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-secondary hover:border-forest/40 hover:bg-white text-ink/60 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-ink leading-tight">
                Infants
              </span>
              <span className="text-xxs text-ink/40">Under 2</span>
            </div>
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={decrementInfants}
                disabled={infants <= 0}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-secondary hover:border-forest/40 hover:bg-white text-ink/60 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-4 text-center text-sm font-bold text-ink">
                {infants}
              </span>
              <button
                type="button"
                onClick={incrementInfants}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-secondary hover:border-forest/40 hover:bg-white text-ink/60 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <hr className="border-border/50" />

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="h-9 w-full rounded-xl bg-forest text-xs font-semibold text-white hover:bg-forest-light transition-all flex items-center justify-center shadow-sm"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
