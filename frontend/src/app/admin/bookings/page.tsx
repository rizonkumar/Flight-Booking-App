"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getAllBookings,
  confirmBooking,
  cancelBooking,
  downloadTicket,
  getFlights,
  createFlight,
  getAirplanes,
  createAirplane,
  getAirports,
  createAirport,
  getCities,
  createCity,
} from "@/lib/api";
import type { Booking, Flight, Airplane, Airport, City } from "@/lib/types";
import {
  Shield,
  Calendar,
  User as UserIcon,
  Plane,
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  Plus,
  Building2,
  MapPin,
  RefreshCw,
  Clock,
  DollarSign,
  Ticket,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/loading-screen";
import { formatDateTime } from "@/lib/format";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useConfirm } from "@/components/ui/modal";

export default function AdminDashboardPage() {
  const router = useRouter();
  const confirm = useConfirm();
  const [authorized, setAuthorized] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "bookings" | "flights" | "airplanes-airports" | "cities"
  >("bookings");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [airplanes, setAirplanes] = useState<Airplane[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null); // bookingId or flightId being processed

  const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);
  const [isAirplaneModalOpen, setIsAirplaneModalOpen] = useState(false);
  const [isAirportModalOpen, setIsAirportModalOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  const [flightNumber, setFlightNumber] = useState("");
  const [selectedAirplaneId, setSelectedAirplaneId] = useState("");
  const [departureAirportId, setDepartureAirportId] = useState("");
  const [arrivalAirportId, setArrivalAirportId] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [price, setPrice] = useState("");
  const [totalSeats, setTotalSeats] = useState("");

  const [airplaneModel, setAirplaneModel] = useState("");
  const [airplaneCapacity, setAirplaneCapacity] = useState("");

  const [airportName, setAirportName] = useState("");
  const [airportCode, setAirportCode] = useState("");
  const [airportCityId, setAirportCityId] = useState("");
  const [airportAddress, setAirportAddress] = useState("");

  const [cityName, setCityName] = useState("");

  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>("all");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        bookingsData,
        flightsData,
        airplanesData,
        airportsData,
        citiesData,
      ] = await Promise.all([
        getAllBookings(),
        getFlights(),
        getAirplanes(),
        getAirports(),
        getCities(),
      ]);
      setBookings(bookingsData);
      setFlights(flightsData);
      setAirplanes(airplanesData);
      setAirports(airportsData);
      setCities(citiesData);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load admin data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const userStr = localStorage.getItem("skyroute_user");
        const token = localStorage.getItem("skyroute_token");
        if (userStr && token) {
          try {
            const user = JSON.parse(userStr);
            if (user.role === "admin") {
              setAuthorized(true);
              return;
            }
          } catch (e) {
            console.error(e);
          }
        }
        setAuthorized(false);
        router.push("/");
      }
    };

    checkAuth();

    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("skyroute_user");
      const token = localStorage.getItem("skyroute_token");
      if (userStr && token) {
        try {
          const user = JSON.parse(userStr);
          if (user.role === "admin") {
            fetchData();
          }
        } catch (e) {}
      }
    }

    window.addEventListener("skyroute-auth-change", checkAuth);
    return () => {
      window.removeEventListener("skyroute-auth-change", checkAuth);
    };
  }, [router]);

  useEffect(() => {
    if (selectedAirplaneId) {
      const airplane = airplanes.find(
        (a) => a.id === parseInt(selectedAirplaneId),
      );
      if (airplane) {
        setTotalSeats(airplane.capacity.toString());
      }
    }
  }, [selectedAirplaneId, airplanes]);

  const handleConfirmBooking = async (id: number) => {
    setActionLoading(id);
    try {
      await confirmBooking(id);
      await fetchData();
    } catch (err: any) {
      await confirm({
        title: "Confirmation Failed",
        description: err.response?.data?.message || "Failed to confirm booking",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelBooking = async (id: number) => {
    const isConfirmed = await confirm({
      title: "Cancel Booking",
      description:
        "Are you sure you want to cancel this booking? This will grant a 100% full refund to the user.",
      variant: "destructive",
      confirmText: "Cancel Booking",
      cancelText: "Keep Booking",
    });
    if (!isConfirmed) {
      return;
    }
    setActionLoading(id);
    try {
      await cancelBooking(id);
      await fetchData();
    } catch (err: any) {
      await confirm({
        title: "Error Cancelling",
        description: err.response?.data?.message || "Failed to cancel booking",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadTicket = async (id: number) => {
    try {
      const blob = await downloadTicket(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `skyroute-ticket-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      await confirm({
        title: "Download Failed",
        description:
          "Failed to download ticket. Ensure the booking is confirmed (Booked status).",
        variant: "warning",
      });
    }
  };

  const handleCreateFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !flightNumber ||
      !selectedAirplaneId ||
      !departureAirportId ||
      !arrivalAirportId ||
      !departureTime ||
      !arrivalTime ||
      !price ||
      !totalSeats
    ) {
      await confirm({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "warning",
      });
      return;
    }
    if (departureAirportId === arrivalAirportId) {
      await confirm({
        title: "Routing Conflict",
        description: "Departure and Arrival airports must be different",
        variant: "warning",
      });
      return;
    }
    try {
      await createFlight({
        flightNumber,
        airplaneId: parseInt(selectedAirplaneId),
        departureAirportId,
        arrivalAirportId,
        departureTime: new Date(departureTime).toISOString(),
        arrivalTime: new Date(arrivalTime).toISOString(),
        price: parseFloat(price),
        totalSeats: parseInt(totalSeats),
      });
      setIsFlightModalOpen(false);
      setFlightNumber("");
      setSelectedAirplaneId("");
      setDepartureAirportId("");
      setArrivalAirportId("");
      setDepartureTime("");
      setArrivalTime("");
      setPrice("");
      setTotalSeats("");
      await fetchData();
    } catch (err: any) {
      await confirm({
        title: "Flight Creation Failed",
        description: err.response?.data?.message || "Failed to create flight",
        variant: "destructive",
      });
    }
  };

  const handleCreateAirplane = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!airplaneModel || !airplaneCapacity) {
      await confirm({
        title: "Validation Error",
        description: "Please fill all fields",
        variant: "warning",
      });
      return;
    }
    try {
      await createAirplane({
        modelNumber: airplaneModel,
        capacity: parseInt(airplaneCapacity),
      });
      setIsAirplaneModalOpen(false);
      setAirplaneModel("");
      setAirplaneCapacity("");
      await fetchData();
    } catch (err: any) {
      await confirm({
        title: "Airplane Creation Failed",
        description: err.response?.data?.message || "Failed to create airplane",
        variant: "destructive",
      });
    }
  };

  const handleCreateAirport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!airportName || !airportCode || !airportCityId) {
      await confirm({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "warning",
      });
      return;
    }
    try {
      await createAirport({
        name: airportName,
        code: airportCode.toUpperCase(),
        cityId: parseInt(airportCityId),
        address: airportAddress || undefined,
      });
      setIsAirportModalOpen(false);
      setAirportName("");
      setAirportCode("");
      setAirportCityId("");
      setAirportAddress("");
      await fetchData();
    } catch (err: any) {
      await confirm({
        title: "Airport Creation Failed",
        description: err.response?.data?.message || "Failed to create airport",
        variant: "destructive",
      });
    }
  };

  const handleCreateCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityName) {
      await confirm({
        title: "Validation Error",
        description: "Please fill in city name",
        variant: "warning",
      });
      return;
    }
    try {
      await createCity({ name: cityName });
      setIsCityModalOpen(false);
      setCityName("");
      await fetchData();
    } catch (err: any) {
      await confirm({
        title: "City Creation Failed",
        description: err.response?.data?.message || "Failed to create city",
        variant: "destructive",
      });
    }
  };

  const totalBookingsCount = bookings.length;
  const confirmedBookingsCount = bookings.filter(
    (b) => b.status === "booked",
  ).length;
  const pendingBookingsCount = bookings.filter(
    (b) => b.status === "initiated" || b.status === "pending",
  ).length;
  const cancelledBookingsCount = bookings.filter(
    (b) => b.status === "cancelled",
  ).length;

  const totalRevenue = bookings
    .filter((b) => b.status === "booked")
    .reduce((sum, b) => sum + Number(b.totalCost), 0);

  const filteredBookings = bookings.filter((booking) => {
    const statusMatch =
      bookingFilterStatus === "all" ||
      (bookingFilterStatus === "pending" &&
        (booking.status === "initiated" || booking.status === "pending")) ||
      booking.status === bookingFilterStatus;

    const passengerName =
      `${booking.user?.firstName || ""} ${booking.user?.lastName || ""}`.toLowerCase();
    const passengerEmail = (booking.user?.email || "").toLowerCase();
    const flightCode = (booking.flight?.flightNumber || "").toLowerCase();
    const searchLower = bookingSearch.toLowerCase();

    const searchMatch =
      !bookingSearch ||
      passengerName.includes(searchLower) ||
      passengerEmail.includes(searchLower) ||
      flightCode.includes(searchLower) ||
      booking.id.toString().includes(searchLower);

    return statusMatch && searchMatch;
  });

  if (!authorized) {
    return <LoadingScreen variant="spinner" minHeight="min-h-screen" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-forest/10 border border-forest/20 px-3.5 py-1 text-xs font-semibold text-forest mb-2">
              <Shield className="h-3.5 w-3.5" />
              Administrative Workspace
            </div>
            <h1 className="font-display text-3xl font-extrabold text-ink tracking-tight">
              Admin Control Portal
            </h1>
            <p className="text-sm text-ink/60 mt-1">
              Manage system bookings, schedules, fleets, and airport hubs from a
              single dashboard.
            </p>
          </div>
          <Button
            onClick={fetchData}
            variant="outline"
            className="self-start sm:self-center border-forest/20 text-forest hover:bg-forest/5 flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Portal
          </Button>
        </div>

        {loading && bookings.length === 0 ? (
          <LoadingScreen
            variant="spinner"
            minHeight="py-20"
            className="bg-white border border-border rounded-2xl shadow-sm"
            message="Initializing system datasets..."
          />
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl mb-8 flex items-start gap-3">
            <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm">Synchronisation Error</h3>
              <p className="text-xs text-red-600 mt-1">{error}</p>
              <Button
                onClick={fetchData}
                size="sm"
                className="mt-3 bg-red-600 hover:bg-red-700 text-white"
              >
                Retry Connection
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5 mb-8">
              <Card className="border border-border/80 shadow-sm relative overflow-hidden bg-white group hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-ink/50 uppercase tracking-wider">
                      Total Bookings
                    </span>
                    <Ticket className="h-5 w-5 text-forest/70" />
                  </div>
                  <div className="text-2xl font-extrabold text-ink">
                    {totalBookingsCount}
                  </div>
                  <p className="text-[10px] text-ink/40 mt-1 font-medium">
                    All requested itineraries
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border/80 shadow-sm relative overflow-hidden bg-white group hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-ink/50 uppercase tracking-wider">
                      Gross Revenue
                    </span>
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-700">
                    ${totalRevenue.toLocaleString()}
                  </div>
                  <p className="text-[10px] text-ink/40 mt-1 font-medium">
                    From confirmed flights
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border/80 shadow-sm relative overflow-hidden bg-white group hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-ink/50 uppercase tracking-wider">
                      Confirmed
                    </span>
                    <CheckCircle2 className="h-5 w-5 text-forest" />
                  </div>
                  <div className="text-2xl font-extrabold text-forest">
                    {confirmedBookingsCount}
                  </div>
                  <p className="text-[10px] text-ink/40 mt-1 font-medium">
                    Fully booked ticket seats
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border/80 shadow-sm relative overflow-hidden bg-white group hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-ink/50 uppercase tracking-wider">
                      Pending/Initiated
                    </span>
                    <Clock className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-amber-600">
                    {pendingBookingsCount}
                  </div>
                  <p className="text-[10px] text-ink/40 mt-1 font-medium">
                    Awaiting manual approval
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border/80 shadow-sm relative overflow-hidden bg-white group hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-ink/50 uppercase tracking-wider">
                      Cancelled
                    </span>
                    <XCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-red-600">
                    {cancelledBookingsCount}
                  </div>
                  <p className="text-[10px] text-ink/40 mt-1 font-medium">
                    Void itineraries
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex border-b border-border mb-6 overflow-x-auto scrollbar-none gap-2">
              <button
                onClick={() => setActiveTab("bookings")}
                className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "bookings"
                    ? "border-forest text-forest bg-forest/5 rounded-t-xl"
                    : "border-transparent text-ink/50 hover:text-ink hover:bg-slate-100 rounded-t-xl"
                }`}
              >
                <Ticket className="h-4 w-4" />
                Bookings Log
              </button>
              <button
                onClick={() => setActiveTab("flights")}
                className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "flights"
                    ? "border-forest text-forest bg-forest/5 rounded-t-xl"
                    : "border-transparent text-ink/50 hover:text-ink hover:bg-slate-100 rounded-t-xl"
                }`}
              >
                <Plane className="h-4 w-4" />
                Flight Schedules
              </button>
              <button
                onClick={() => setActiveTab("airplanes-airports")}
                className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "airplanes-airports"
                    ? "border-forest text-forest bg-forest/5 rounded-t-xl"
                    : "border-transparent text-ink/50 hover:text-ink hover:bg-slate-100 rounded-t-xl"
                }`}
              >
                <Building2 className="h-4 w-4" />
                Fleets & Airports
              </button>
              <button
                onClick={() => setActiveTab("cities")}
                className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "cities"
                    ? "border-forest text-forest bg-forest/5 rounded-t-xl"
                    : "border-transparent text-ink/50 hover:text-ink hover:bg-slate-100 rounded-t-xl"
                }`}
              >
                <MapPin className="h-4 w-4" />
                Regions / Cities
              </button>
            </div>

            {activeTab === "bookings" && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-border shadow-sm">
                  <div className="relative w-full md:w-96">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
                    <Input
                      type="text"
                      placeholder="Search passenger, email, flight or reference..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      className="pl-10 border-border bg-slate-50 focus-visible:ring-forest focus-visible:bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto py-1 scrollbar-none">
                    <Filter className="h-4 w-4 text-ink/50 shrink-0" />
                    {[
                      { value: "all", label: "All Bookings" },
                      { value: "pending", label: "Pending Approval" },
                      { value: "booked", label: "Confirmed" },
                      { value: "cancelled", label: "Cancelled" },
                    ].map((pill) => (
                      <button
                        key={pill.value}
                        onClick={() => setBookingFilterStatus(pill.value)}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all shrink-0 ${
                          bookingFilterStatus === pill.value
                            ? "bg-forest border-forest text-white shadow-sm"
                            : "bg-slate-50 border-border text-ink/65 hover:bg-slate-100"
                        }`}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Card className="border border-border shadow-sm overflow-hidden bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-border">
                          <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-ink/60">
                            ID / Ref
                          </th>
                          <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-ink/60">
                            Passenger
                          </th>
                          <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-ink/60">
                            Itinerary
                          </th>
                          <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-ink/60">
                            Seats & Price
                          </th>
                          <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-ink/60">
                            Status
                          </th>
                          <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-ink/60 text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {filteredBookings.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="text-center py-12 text-ink/40 text-sm font-medium"
                            >
                              No matching passenger bookings found.
                            </td>
                          </tr>
                        ) : (
                          filteredBookings.map((booking) => {
                            const isPending =
                              booking.status === "initiated" ||
                              booking.status === "pending";
                            const isConfirmed = booking.status === "booked";
                            const isCancelled = booking.status === "cancelled";

                            return (
                              <tr
                                key={booking.id}
                                className="hover:bg-slate-50/50 transition-colors"
                              >
                                <td className="py-5 px-6 font-display font-bold text-ink">
                                  #{booking.id}
                                  <div className="text-[10px] font-sans font-normal text-ink/40 mt-1">
                                    {new Date(
                                      booking.createdAt,
                                    ).toLocaleDateString()}
                                  </div>
                                </td>
                                <td className="py-5 px-6">
                                  <div className="font-semibold text-ink text-sm">
                                    {booking.user
                                      ? `${booking.user.firstName} ${booking.user.lastName || ""}`.trim()
                                      : "System User"}
                                  </div>
                                  <div className="text-xs text-ink/50 font-normal mt-0.5">
                                    {booking.user?.email ||
                                      `User ID: ${booking.userId}`}
                                  </div>
                                </td>
                                <td className="py-5 px-6">
                                  {booking.flight ? (
                                    <div>
                                      <div className="flex items-center gap-1.5 text-sm font-bold text-ink font-display">
                                        <span>
                                          {booking.flight.departureAirportId}
                                        </span>
                                        <ChevronRight className="h-3.5 w-3.5 text-ink/30" />
                                        <span>
                                          {booking.flight.arrivalAirportId}
                                        </span>
                                        <Badge className="ml-2 bg-mint/45 text-forest font-semibold text-[10px] hover:bg-mint/45 px-1.5 border border-forest/15">
                                          {booking.flight.flightNumber}
                                        </Badge>
                                      </div>
                                      <div className="text-[10px] text-ink/45 mt-1 font-sans">
                                        Departure:{" "}
                                        {formatDateTime(
                                          booking.flight.departureTime,
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-red-500 text-xs">
                                      Itinerary Removed (ID: {booking.flightId})
                                    </span>
                                  )}
                                </td>
                                <td className="py-5 px-6">
                                  <div className="font-semibold text-sm text-ink">
                                    {booking.noOfSeats}{" "}
                                    {booking.noOfSeats === 1 ? "Seat" : "Seats"}
                                  </div>
                                  <div className="text-xs text-emerald-700 font-bold mt-0.5">
                                    ${booking.totalCost}
                                  </div>
                                </td>
                                <td className="py-5 px-6">
                                  {isConfirmed && (
                                    <Badge className="bg-forest/10 border border-forest/20 text-forest font-bold rounded-full py-1 hover:bg-forest/15">
                                      Booked (Confirmed)
                                    </Badge>
                                  )}
                                  {isPending && (
                                    <Badge className="bg-amber-100 border border-amber-300 text-amber-800 font-bold rounded-full py-1 hover:bg-amber-150">
                                      Awaiting Approval
                                    </Badge>
                                  )}
                                  {isCancelled && (
                                    <Badge className="bg-red-50 border border-red-200 text-red-700 font-bold rounded-full py-1 hover:bg-red-100">
                                      Cancelled
                                    </Badge>
                                  )}
                                </td>
                                <td className="py-5 px-6 text-right space-x-1.5 shrink-0">
                                  {isPending && (
                                    <Button
                                      size="sm"
                                      disabled={actionLoading === booking.id}
                                      onClick={() =>
                                        handleConfirmBooking(booking.id)
                                      }
                                      className="bg-forest hover:bg-forest-light text-white text-xs py-1 h-8 font-semibold shadow-sm"
                                    >
                                      Confirm Booking
                                    </Button>
                                  )}
                                  {!isCancelled && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={actionLoading === booking.id}
                                      onClick={() =>
                                        handleCancelBooking(booking.id)
                                      }
                                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 text-xs py-1 h-8 font-semibold"
                                    >
                                      Cancel
                                    </Button>
                                  )}
                                  {isConfirmed && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        handleDownloadTicket(booking.id)
                                      }
                                      className="text-forest hover:bg-forest/5 hover:text-forest text-xs py-1 h-8 font-semibold"
                                    >
                                      <Download className="h-4.5 w-4.5 mr-1" />
                                      Ticket
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* TAB CONTENT: FLIGHTS */}
            {activeTab === "flights" && (
              <div className="space-y-6">
                {/* Form Trigger Modal */}
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-border shadow-sm">
                  <span className="text-sm font-semibold text-ink/70">
                    Scheduled Flight Log ({flights.length} active routes)
                  </span>
                  <Dialog
                    open={isFlightModalOpen}
                    onOpenChange={setIsFlightModalOpen}
                  >
                    <DialogTrigger
                      render={
                        <Button className="bg-forest hover:bg-forest-light text-white font-semibold text-sm shadow-sm flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Create Flight
                        </Button>
                      }
                    />
                    <DialogContent className="sm:max-w-[500px] border border-border bg-white rounded-2xl">
                      <form onSubmit={handleCreateFlight}>
                        <DialogHeader>
                          <DialogTitle className="font-display font-extrabold text-xl text-ink">
                            Schedule New Flight
                          </DialogTitle>
                          <DialogDescription className="text-ink/50 text-xs">
                            Configure airplane capacity, routing hub, and
                            pricing parameters.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-ink/70">
                                Flight Number
                              </label>
                              <Input
                                placeholder="e.g. AI-302"
                                value={flightNumber}
                                onChange={(e) =>
                                  setFlightNumber(e.target.value)
                                }
                                className="border-border text-sm"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-ink/70">
                                Select Airplane Fleet
                              </label>
                              <select
                                value={selectedAirplaneId}
                                onChange={(e) =>
                                  setSelectedAirplaneId(e.target.value)
                                }
                                className="w-full rounded-md border border-border bg-white py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-forest"
                              >
                                <option value="">Select airplane...</option>
                                {airplanes.map((a) => (
                                  <option key={a.id} value={a.id}>
                                    {a.modelNumber} (Cap: {a.capacity})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-ink/70">
                                Departure Airport
                              </label>
                              <select
                                value={departureAirportId}
                                onChange={(e) =>
                                  setDepartureAirportId(e.target.value)
                                }
                                className="w-full rounded-md border border-border bg-white py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-forest"
                              >
                                <option value="">Select departure...</option>
                                {airports.map((a) => (
                                  <option key={a.id} value={a.code}>
                                    {a.code} - {a.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-ink/70">
                                Arrival Airport
                              </label>
                              <select
                                value={arrivalAirportId}
                                onChange={(e) =>
                                  setArrivalAirportId(e.target.value)
                                }
                                className="w-full rounded-md border border-border bg-white py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-forest"
                              >
                                <option value="">Select arrival...</option>
                                {airports.map((a) => (
                                  <option key={a.id} value={a.code}>
                                    {a.code} - {a.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-ink/70">
                                Departure Time
                              </label>
                              <Input
                                type="datetime-local"
                                value={departureTime}
                                onChange={(e) =>
                                  setDepartureTime(e.target.value)
                                }
                                className="border-border text-sm"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-ink/70">
                                Arrival Time
                              </label>
                              <Input
                                type="datetime-local"
                                value={arrivalTime}
                                onChange={(e) => setArrivalTime(e.target.value)}
                                className="border-border text-sm"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-ink/70">
                                Seat Fare Price ($ USD)
                              </label>
                              <Input
                                type="number"
                                placeholder="Price"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="border-border text-sm"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-ink/70">
                                Seat Capacity
                              </label>
                              <Input
                                type="number"
                                placeholder="Total Seats"
                                value={totalSeats}
                                onChange={(e) => setTotalSeats(e.target.value)}
                                className="border-border text-sm"
                                disabled
                              />
                              <p className="text-[9px] text-ink/40">
                                Matches airplane fleet limit
                              </p>
                            </div>
                          </div>
                        </div>
                        <DialogFooter className="mt-4 border-t border-border pt-4 gap-2 sm:gap-0">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsFlightModalOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="bg-forest hover:bg-forest-light text-white font-semibold"
                          >
                            Publish Schedule
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Flights Grid list */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {flights.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white border border-border rounded-2xl shadow-sm text-ink/40 text-sm font-medium">
                      No active flight itineraries recorded.
                    </div>
                  ) : (
                    flights.map((f) => (
                      <Card
                        key={f.id}
                        className="border border-border/80 shadow-sm bg-white overflow-hidden group hover:border-forest/35 hover:shadow-md transition-all"
                      >
                        <CardHeader className="bg-slate-50/50 p-4 border-b border-border/40">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1 bg-mint/45 text-forest border border-forest/15 px-2.5 py-0.5 rounded-full text-xs font-bold font-display">
                              <Plane className="h-3 w-3 shrink-0" />
                              {f.flightNumber}
                            </div>
                            <span className="text-sm font-extrabold text-emerald-700">
                              ${f.price}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-lg font-bold font-display text-ink">
                                {f.departureAirportId}
                              </div>
                              <div className="text-[10px] text-ink/50 font-medium">
                                Departure Airport
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-ink/30" />
                            <div className="text-right">
                              <div className="text-lg font-bold font-display text-ink">
                                {f.arrivalAirportId}
                              </div>
                              <div className="text-[10px] text-ink/50 font-medium">
                                Arrival Airport
                              </div>
                            </div>
                          </div>

                          <Separator className="bg-border/60" />

                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <div className="text-ink/40 font-medium mb-0.5">
                                Departing Time
                              </div>
                              <div className="font-semibold text-ink">
                                {formatDateTime(f.departureTime)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-ink/40 font-medium mb-0.5">
                                Arriving Time
                              </div>
                              <div className="font-semibold text-ink">
                                {formatDateTime(f.arrivalTime)}
                              </div>
                            </div>
                          </div>

                          <Separator className="bg-border/60" />

                          <div className="flex justify-between items-center text-xs">
                            <div className="text-ink/55">
                              Fleet:{" "}
                              <span className="font-bold text-ink">
                                {f.Airplane?.modelNumber ||
                                  `ID: ${f.airplaneId}`}
                              </span>
                            </div>
                            <div className="text-ink/55">
                              Seats Capacity:{" "}
                              <span className="font-bold text-ink">
                                {f.totalSeats}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: AIRPLANES & AIRPORTS */}
            {activeTab === "airplanes-airports" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Airplane column */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-border shadow-sm">
                    <div>
                      <h3 className="font-bold text-ink text-sm flex items-center gap-1.5">
                        <Plane className="h-4.5 w-4.5 text-forest" />
                        Airplane Fleets
                      </h3>
                      <p className="text-[10px] text-ink/40">
                        Total Registered: {airplanes.length}
                      </p>
                    </div>

                    <Dialog
                      open={isAirplaneModalOpen}
                      onOpenChange={setIsAirplaneModalOpen}
                    >
                      <DialogTrigger
                        render={
                          <Button
                            size="sm"
                            className="bg-forest hover:bg-forest-light text-white font-semibold text-xs shadow-sm flex items-center gap-1"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Fleet
                          </Button>
                        }
                      />
                      <DialogContent className="sm:max-w-[400px] border border-border bg-white rounded-2xl">
                        <form onSubmit={handleCreateAirplane}>
                          <DialogHeader>
                            <DialogTitle className="font-display font-extrabold text-xl text-ink">
                              Register Fleet Airplane
                            </DialogTitle>
                            <DialogDescription className="text-ink/50 text-xs">
                              Input details to register a new airplane in the
                              fleet.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-ink/70">
                                Model Number
                              </label>
                              <Input
                                placeholder="e.g. Boeing 777-300ER"
                                value={airplaneModel}
                                onChange={(e) =>
                                  setAirplaneModel(e.target.value)
                                }
                                className="border-border text-sm"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-ink/70">
                                Capacity Limit (Seats)
                              </label>
                              <Input
                                type="number"
                                placeholder="e.g. 280"
                                value={airplaneCapacity}
                                onChange={(e) =>
                                  setAirplaneCapacity(e.target.value)
                                }
                                className="border-border text-sm"
                              />
                            </div>
                          </div>
                          <DialogFooter className="mt-4 border-t border-border pt-4 gap-2 sm:gap-0">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setIsAirplaneModalOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              size="sm"
                              className="bg-forest hover:bg-forest-light text-white font-semibold"
                            >
                              Register Fleet
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Card className="border border-border shadow-sm bg-white overflow-hidden">
                    <div className="divide-y divide-border/60 max-h-[500px] overflow-y-auto">
                      {airplanes.length === 0 ? (
                        <div className="p-6 text-center text-ink/40 text-xs">
                          No registered airplanes found.
                        </div>
                      ) : (
                        airplanes.map((a) => (
                          <div
                            key={a.id}
                            className="p-4 flex justify-between items-center hover:bg-slate-50/40"
                          >
                            <div>
                              <div className="text-sm font-bold text-ink font-display">
                                {a.modelNumber}
                              </div>
                              <div className="text-[10px] text-ink/45 mt-0.5">
                                Fleet Identifier ID: #{a.id}
                              </div>
                            </div>
                            <Badge className="bg-forest/10 border border-forest/15 text-forest text-xs font-bold px-2 py-0.5 rounded-full">
                              {a.capacity} Seats
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </div>

                {/* Airport Hubs Column */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-border shadow-sm">
                    <div>
                      <h3 className="font-bold text-ink text-sm flex items-center gap-1.5">
                        <Building2 className="h-4.5 w-4.5 text-forest" />
                        Airport Hubs
                      </h3>
                      <p className="text-[10px] text-ink/40">
                        Total Hubs: {airports.length}
                      </p>
                    </div>

                    <Dialog
                      open={isAirportModalOpen}
                      onOpenChange={setIsAirportModalOpen}
                    >
                      <DialogTrigger
                        render={
                          <Button
                            size="sm"
                            className="bg-forest hover:bg-forest-light text-white font-semibold text-xs shadow-sm flex items-center gap-1"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Hub
                          </Button>
                        }
                      />
                      <DialogContent className="sm:max-w-[400px] border border-border bg-white rounded-2xl">
                        <form onSubmit={handleCreateAirport}>
                          <DialogHeader>
                            <DialogTitle className="font-display font-extrabold text-xl text-ink">
                              Register Airport Hub
                            </DialogTitle>
                            <DialogDescription className="text-ink/50 text-xs">
                              Register a new departure or arrival airport hub.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="grid grid-cols-3 gap-3">
                              <div className="col-span-2 space-y-1.5">
                                <label className="text-xs font-bold text-ink/70">
                                  Airport Name
                                </label>
                                <Input
                                  placeholder="e.g. Heathrow Airport"
                                  value={airportName}
                                  onChange={(e) =>
                                    setAirportName(e.target.value)
                                  }
                                  className="border-border text-sm"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-ink/70">
                                  3-Code
                                </label>
                                <Input
                                  placeholder="LHR"
                                  maxLength={3}
                                  value={airportCode}
                                  onChange={(e) =>
                                    setAirportCode(e.target.value)
                                  }
                                  className="border-border text-sm uppercase"
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-ink/70">
                                Select Hub City
                              </label>
                              <select
                                value={airportCityId}
                                onChange={(e) =>
                                  setAirportCityId(e.target.value)
                                }
                                className="w-full rounded-md border border-border bg-white py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-forest"
                              >
                                <option value="">Select city...</option>
                                {cities.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-ink/70">
                                Physical Address (Optional)
                              </label>
                              <Input
                                placeholder="e.g. Hounslow, Greater London"
                                value={airportAddress}
                                onChange={(e) =>
                                  setAirportAddress(e.target.value)
                                }
                                className="border-border text-sm"
                              />
                            </div>
                          </div>
                          <DialogFooter className="mt-4 border-t border-border pt-4 gap-2 sm:gap-0">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setIsAirportModalOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              size="sm"
                              className="bg-forest hover:bg-forest-light text-white font-semibold"
                            >
                              Register Hub
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Card className="border border-border shadow-sm bg-white overflow-hidden">
                    <div className="divide-y divide-border/60 max-h-[500px] overflow-y-auto">
                      {airports.length === 0 ? (
                        <div className="p-6 text-center text-ink/40 text-xs">
                          No registered airport hubs found.
                        </div>
                      ) : (
                        airports.map((a) => (
                          <div
                            key={a.id}
                            className="p-4 flex justify-between items-center hover:bg-slate-50/40"
                          >
                            <div>
                              <div className="text-sm font-bold text-ink font-display">
                                {a.name}
                              </div>
                              <div className="text-[10px] text-ink/45 mt-0.5">
                                Region City:{" "}
                                {a.City?.name || `City ID: ${a.cityId}`}{" "}
                                {a.address && `| ${a.address}`}
                              </div>
                            </div>
                            <Badge className="bg-mint/40 border border-forest/15 text-forest text-xs font-bold px-2 py-0.5 rounded-full font-display">
                              {a.code}
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "cities" && (
              <div className="space-y-4 max-w-xl mx-auto">
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-border shadow-sm">
                  <div>
                    <h3 className="font-bold text-ink text-sm flex items-center gap-1.5">
                      <MapPin className="h-4.5 w-4.5 text-forest" />
                      Supported Regions / Cities
                    </h3>
                    <p className="text-[10px] text-ink/40">
                      Active coverage: {cities.length} global regions
                    </p>
                  </div>

                  <Dialog
                    open={isCityModalOpen}
                    onOpenChange={setIsCityModalOpen}
                  >
                    <DialogTrigger
                      render={
                        <Button
                          size="sm"
                          className="bg-forest hover:bg-forest-light text-white font-semibold text-xs shadow-sm flex items-center gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add City
                        </Button>
                      }
                    />
                    <DialogContent className="sm:max-w-[400px] border border-border bg-white rounded-2xl">
                      <form onSubmit={handleCreateCity}>
                        <DialogHeader>
                          <DialogTitle className="font-display font-extrabold text-xl text-ink">
                            Register Target City
                          </DialogTitle>
                          <DialogDescription className="text-ink/50 text-xs">
                            Enter name to open new travel regions.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-ink/70">
                              City Name
                            </label>
                            <Input
                              placeholder="e.g. London"
                              value={cityName}
                              onChange={(e) => setCityName(e.target.value)}
                              className="border-border text-sm"
                            />
                          </div>
                        </div>
                        <DialogFooter className="mt-4 border-t border-border pt-4 gap-2 sm:gap-0">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsCityModalOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            size="sm"
                            className="bg-forest hover:bg-forest-light text-white font-semibold"
                          >
                            Add City
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card className="border border-border shadow-sm bg-white overflow-hidden">
                  <div className="divide-y divide-border/60">
                    {cities.length === 0 ? (
                      <div className="p-6 text-center text-ink/40 text-xs">
                        No coverage cities found.
                      </div>
                    ) : (
                      cities.map((c) => (
                        <div
                          key={c.id}
                          className="p-4 flex justify-between items-center hover:bg-slate-50/40"
                        >
                          <div>
                            <div className="text-sm font-semibold text-ink font-display">
                              {c.name}
                            </div>
                          </div>
                          <span className="text-[10px] text-ink/35 font-medium font-sans">
                            Identifier ID: #{c.id}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
