"use client";

import { useState, useEffect, useRef } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_OF_WEEK = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function CustomDatePicker({
  value,
  onChange,
  label,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const initialDate = value ? new Date(value) : null;

  const [viewDate, setViewDate] = useState(() => {
    return initialDate && !isNaN(initialDate.getTime())
      ? initialDate
      : new Date();
  });

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

  const getFormattedDate = () => {
    if (!value) return "Select date";
    const dateObj = new Date(value);
    if (isNaN(dateObj.getTime())) return "Select date";

    const day = dateObj.getDate();
    const month = MONTHS[dateObj.getMonth()].slice(0, 3);
    const year = dateObj.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay();
  const adjustedStartDay = (startDayOfWeek + 6) % 7;

  const totalDays = new Date(year, month + 1, 0).getDate();

  const daysArray = [];
  for (let i = 0; i < adjustedStartDay; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    daysArray.push(new Date(year, month, i));
  }

  const handleDaySelect = (day: Date) => {
    const y = day.getFullYear();
    const m = String(day.getMonth() + 1).padStart(2, "0");
    const d = String(day.getDate()).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  const isSelected = (day: Date) => {
    if (!value) return false;
    const selectedDate = new Date(value);
    return (
      day.getFullYear() === selectedDate.getFullYear() &&
      day.getMonth() === selectedDate.getMonth() &&
      day.getDate() === selectedDate.getDate()
    );
  };

  const isToday = (day: Date) => {
    const todayDate = new Date();
    return (
      day.getFullYear() === todayDate.getFullYear() &&
      day.getMonth() === todayDate.getMonth() &&
      day.getDate() === todayDate.getDate()
    );
  };

  const isPast = (day: Date) => {
    return day < today;
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/50">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-12 w-full items-center gap-3 rounded-xl border border-border bg-white px-4 text-left shadow-sm transition-all focus:border-forest focus:ring-2 focus:ring-forest/10 hover:border-forest/30 ${
          isOpen ? "border-forest ring-2 ring-forest/10" : ""
        }`}
      >
        <CalendarIcon className="h-4 w-4 shrink-0 text-forest" />
        <span className="text-sm font-semibold text-ink leading-tight truncate">
          {getFormattedDate()}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-white/20 bg-white/95 backdrop-blur-xl p-4 shadow-2xl animate-in fade-in-0 slide-in-from-top-4 duration-200">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary text-ink/65 hover:text-ink transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold text-ink">
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary text-ink/65 hover:text-ink transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-1.5 grid grid-cols-7 gap-1 text-center">
            {DAYS_OF_WEEK.map((d) => (
              <span
                key={d}
                className="text-xxs font-bold text-ink/40 uppercase"
              >
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {daysArray.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} />;
              }

              const disabled = isPast(day);
              const selected = isSelected(day);
              const current = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleDaySelect(day)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                    selected
                      ? "bg-forest text-white shadow-sm font-bold"
                      : current
                        ? "bg-mint/30 text-forest border border-forest/30 font-bold"
                        : "text-ink/80 hover:bg-secondary"
                  } ${
                    disabled
                      ? "opacity-25 cursor-not-allowed hover:bg-transparent"
                      : ""
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
