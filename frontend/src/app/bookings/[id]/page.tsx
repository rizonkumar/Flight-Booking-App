"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Plane,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  CreditCard,
  Calendar,
  Users,
  Hash,
  Download,
  AlertTriangle,
  Clock,
  MapPin,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { makePayment, cancelBooking, downloadTicket, getFlight } from "@/lib/api";
import type { Booking, Flight } from "@/lib/types";
import { formatTime, formatDate } from "@/lib/format";

const statusStyles: Record<string, string> = {
  initiated: "bg-ink/5 text-ink/60 border-ink/10",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  booked: "bg-mint/50 text-forest border-forest/20",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState<any>(null);
  const [cancelError, setCancelError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const stored = localStorage.getItem("skyroute_bookings");
      if (stored) {
        const bookings: Booking[] = JSON.parse(stored);
        const found = bookings.find((b) => b.id === Number(params.id));
        if (found) {
          setBooking(found);
          const flightData = await getFlight(found.flightId.toString());
          setFlight(flightData);
        }
      }
    } catch {
      setCancelError("Could not retrieve related flight information.");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handlePayment() {
    if (!booking) return;
    setPaying(true);
    setPaymentError("");
    try {
      await makePayment({
        bookingId: booking.id,
        userId: booking.userId,
        totalCost: booking.totalCost,
      });
      setPaymentSuccess(true);

      const stored = localStorage.getItem("skyroute_bookings");
      if (stored) {
        const bookings: Booking[] = JSON.parse(stored);
        const updated = bookings.map((b) =>
          b.id === booking.id ? { ...b, status: "booked" as const } : b
        );
        localStorage.setItem("skyroute_bookings", JSON.stringify(updated));
        setBooking({ ...booking, status: "booked" });
      }
    } catch {
      setPaymentError("Payment process failed. Ensure service endpoints are healthy.");
    } finally {
      setPaying(false);
    }
  }

  async function handleCancel() {
    if (!booking) return;
    setCancelling(true);
    setCancelError("");
    try {
      const res = await cancelBooking(booking.id);
      setCancelSuccess(res);

      const stored = localStorage.getItem("skyroute_bookings");
      if (stored) {
        const bookings: Booking[] = JSON.parse(stored);
        const updated = bookings.map((b) =>
          b.id === booking.id ? { ...b, status: "cancelled" as const } : b
        );
        localStorage.setItem("skyroute_bookings", JSON.stringify(updated));
        setBooking({ ...booking, status: "cancelled" });
      }
    } catch {
      setCancelError("Unable to process cancellation policies right now.");
    } finally {
      setCancelling(false);
    }
  }

  async function handleDownload() {
    if (!booking) return;
    setDownloading(true);
    try {
      const blob = await downloadTicket(booking.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SkyRoute-Ticket-${booking.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      setCancelError("Boarding pass generation failed. Please try later.");
    } finally {
      setDownloading(false);
    }
  }

  const getRefundTier = () => {
    if (!flight) return null;
    const diff = new Date(flight.departureTime).getTime() - Date.now();
    const hours = diff / (1000 * 60 * 60);
    if (hours > 48) return { percent: 100, text: "Full Refund (100%)" };
    if (hours >= 24) return { percent: 50, text: "Partial Refund (50%)" };
    return { percent: 0, text: "Non-Refundable (0%)" };
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-forest" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <Plane className="mx-auto h-10 w-10 text-ink/20" />
        <p className="mt-4 font-display text-lg font-semibold text-ink">
          Booking not found
        </p>
        <Button
          onClick={() => router.push("/bookings")}
          className="mt-4 bg-forest text-white hover:bg-forest-light"
        >
          View All Bookings
        </Button>
      </div>
    );
  }

  const refundTier = getRefundTier();

  return (
    <div className="bg-secondary min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <button
          onClick={() => router.push("/bookings")}
          className="mb-6 flex items-center gap-2 text-sm text-ink/50 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          All Bookings
        </button>

        {paymentSuccess && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-forest/20 bg-mint/30 p-4">
            <CheckCircle2 className="h-5 w-5 text-forest" />
            <div>
              <p className="text-sm font-semibold text-forest">
                Payment verified successfully
              </p>
              <p className="text-xs text-forest/70">
                Your flight boarding pass is generated. Download it below.
              </p>
            </div>
          </div>
        )}

        {cancelSuccess && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <XCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm font-semibold text-red-600">
                Booking cancelled successfully
              </p>
              <p className="text-xs text-red-600/70">
                Refund value processed: {cancelSuccess.refundPercent} (INR {cancelSuccess.refundAmount})
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold text-ink">
                  Booking #{booking.id}
                </h1>
                <p className="text-xs text-ink/40 mt-1">
                  Reference: SR-{booking.id}
                </p>
              </div>
              <Badge
                className={`rounded-md border px-3 py-1.5 text-xs font-semibold capitalize ${
                  statusStyles[booking.status] || statusStyles.initiated
                }`}
              >
                {booking.status}
              </Badge>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 text-xs text-ink/40">
                  <Hash className="h-3 w-3" />
                  Flight ID
                </div>
                <p className="mt-1 font-display text-sm font-bold text-ink">
                  {booking.flightId}
                </p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 text-xs text-ink/40">
                  <Users className="h-3 w-3" />
                  Seats
                </div>
                <p className="mt-1 font-display text-sm font-bold text-ink">
                  {booking.noOfSeats}
                </p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 text-xs text-ink/40">
                  <CreditCard className="h-3 w-3" />
                  Total Fare
                </div>
                <p className="mt-1 font-display text-sm font-bold text-ink">
                  INR {booking.totalCost.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 text-xs text-ink/40">
                  <Calendar className="h-3 w-3" />
                  Booked On
                </div>
                <p className="mt-1 font-display text-sm font-bold text-ink">
                  {new Date(booking.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {flight && (
            <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
              <h3 className="font-display text-md font-bold text-ink mb-4">
                Flight Schedule
              </h3>
              
              <div className="rounded-xl border border-border bg-secondary p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display text-xl font-bold text-ink">
                      {formatTime(new Date(flight.departureTime))}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-forest">
                      {flight.departureAirportId}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-ink/40">
                      <MapPin className="h-2.5 w-2.5" />
                      Departure
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col items-center px-4 pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-ink/50">
                      <Clock className="h-3 w-3" />
                      Direct flight
                    </div>
                    <div className="relative my-2.5 flex w-full items-center">
                      <div className="h-px flex-1 border-t border-dashed border-ink/20" />
                      <div className="mx-2 flex h-6 w-6 items-center justify-center rounded-full border border-forest/20 bg-white">
                        <Plane className="h-3.5 w-3.5 text-forest" />
                      </div>
                      <div className="h-px flex-1 border-t border-dashed border-ink/20" />
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-display text-xl font-bold text-ink">
                      {formatTime(new Date(flight.arrivalTime))}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-forest">
                      {flight.arrivalAirportId}
                    </p>
                    <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-ink/40">
                      <MapPin className="h-2.5 w-2.5" />
                      Arrival
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-[10px] uppercase tracking-wider text-ink/40">Flight Number</p>
                  <p className="mt-0.5 font-display text-xs font-bold text-ink">{flight.flightNumber}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-[10px] uppercase tracking-wider text-ink/40">Departure Date</p>
                  <p className="mt-0.5 font-display text-xs font-bold text-ink">{formatDate(new Date(flight.departureTime))}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-[10px] uppercase tracking-wider text-ink/40">Boarding Gate</p>
                  <p className="mt-0.5 font-display text-xs font-bold text-ink">{flight.boardingGate || "TBA"}</p>
                </div>
              </div>
            </div>
          )}

          {booking.status === "initiated" && !paymentSuccess && (
            <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
              <h3 className="font-display text-md font-bold text-ink">
                Secure Confirmation
              </h3>
              <p className="mt-1 text-xs text-ink/50">
                Process your fare of INR {booking.totalCost.toLocaleString()} to guarantee seating capacity.
              </p>

              {paymentError && (
                <p className="mt-3 rounded-lg bg-red-50 p-2.5 text-xs text-red-600 border border-red-200/50">
                  {paymentError}
                </p>
              )}

              <Button
                onClick={handlePayment}
                disabled={paying}
                className="mt-4 h-11 w-full rounded-lg bg-forest text-sm font-semibold text-white transition-colors hover:bg-forest-light disabled:opacity-50"
              >
                {paying ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                {paying ? "Processing payment..." : `Pay INR ${booking.totalCost.toLocaleString()}`}
              </Button>
            </div>
          )}

          {booking.status === "booked" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-white p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-sm font-bold text-ink">
                    Boarding Ticket
                  </h3>
                  <p className="mt-1 text-xs text-ink/50">
                    Get a beautifully styled A4 format boarding pass containing flight codes and scannable QR details.
                  </p>
                </div>

                <Button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="mt-4 h-10 w-full rounded-lg bg-forest text-xs font-semibold text-white transition-colors hover:bg-forest-light"
                >
                  {downloading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  {downloading ? "Generating pass..." : "Download Boarding Pass"}
                </Button>
              </div>

              {refundTier && (
                <div className="rounded-2xl border border-border bg-white p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-sm font-bold text-ink">
                      Cancellation Policy
                    </h3>
                    <p className="mt-1 text-xs text-ink/50">
                      Based on current departure margins, you are eligible for:
                    </p>
                    <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200/50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {refundTier.text}
                    </div>
                  </div>

                  <Button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="mt-4 h-10 w-full rounded-lg bg-red-600 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                  >
                    {cancelling ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {cancelling ? "Processing cancel..." : "Cancel Booking"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {cancelError && (
            <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 border border-red-200/50">
              {cancelError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
