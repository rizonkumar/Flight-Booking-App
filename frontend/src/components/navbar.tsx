"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plane, Menu, X, User, LogOut, Loader2, Mail, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { signin, signup } from "@/lib/api";
import axios from "axios";
import type { User as UserType } from "@/lib/types";

const navLinks = [
  { href: "/", label: "Search Flights" },
  { href: "/bookings", label: "My Bookings" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [user, setUser] = useState<UserType | null>(null);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");

  const activeLinks = [
    ...navLinks,
    ...(user?.role === "admin" ? [{ href: "/admin/bookings", label: "Admin Portal" }] : []),
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("skyroute_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("skyroute_token");
    localStorage.removeItem("skyroute_user");
    setUser(null);
    setMobileOpen(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (authMode === "signin") {
        const res = await signin({ email, password });
        localStorage.setItem("skyroute_token", res.tokens.accessToken);
        localStorage.setItem("skyroute_user", JSON.stringify(res.user));
        setUser(res.user);
        setModalOpen(false);
        resetForm();
      } else {
        const res = await signup({ email, password, firstName, lastName });
        localStorage.setItem("skyroute_token", res.tokens.accessToken);
        localStorage.setItem("skyroute_user", JSON.stringify(res.user));
        setUser(res.user);
        setModalOpen(false);
        resetForm();
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const resData = err.response?.data as { message?: string; error?: string } | undefined;
        setError(resData?.message || resData?.error || "Authentication failed. Please try again.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setError("");
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest">
              <Plane className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-ink">
              SkyRoute
            </span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {activeLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-4 py-2 text-[13px] font-semibold tracking-wide transition-colors",
                  pathname === link.href
                    ? "bg-forest text-white"
                    : "text-ink/50 hover:text-ink hover:bg-ink/5"
                )}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className="ml-4 flex items-center gap-4 border-l border-border pl-4">
                <div className="flex items-center gap-2 rounded-lg bg-mint/30 px-3 py-1.5 text-xs font-semibold text-forest">
                  <User className="h-3.5 w-3.5" />
                  <span>{user.firstName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-lg p-2 text-ink/40 hover:bg-ink/5 hover:text-red-500 transition-colors"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode("signin");
                  setModalOpen(true);
                }}
                className="ml-4 rounded-lg bg-forest px-4 py-2 text-[13px] font-semibold text-white tracking-wide transition-colors hover:bg-forest-light"
              >
                Sign In
              </button>
            )}
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            {user && (
              <div className="rounded-lg bg-mint/30 px-3 py-1.5 text-xs font-semibold text-forest">
                {user.firstName}
              </div>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-ink/50 hover:bg-ink/5"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-border/60 bg-white px-4 py-3 md:hidden space-y-1">
            {activeLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block rounded-lg px-4 py-3 text-sm font-semibold transition-colors",
                  pathname === link.href
                    ? "bg-forest text-white"
                    : "text-ink/50 hover:text-ink hover:bg-ink/5"
                )}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-red-500 hover:bg-ink/5 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setAuthMode("signin");
                  setModalOpen(true);
                }}
                className="w-full rounded-lg bg-forest py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-forest-light"
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </header>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all border border-border">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-ink/40 hover:bg-ink/5 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-mint/30">
                <Plane className="h-6 w-6 text-forest" />
              </div>
              <h3 className="font-display text-xl font-bold text-ink">
                {authMode === "signin" ? "Welcome back" : "Create account"}
              </h3>
              <p className="mt-1 text-xs text-ink/50">
                {authMode === "signin"
                  ? "Access your bookings and flight searches"
                  : "Join SkyRoute to experience seamless travel booking"}
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200/50 p-3 text-xs text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === "signup" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-ink/60">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2 text-sm text-ink outline-none transition-all focus:border-forest focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink/60">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2 text-sm text-ink outline-none transition-all focus:border-forest focus:bg-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-ink/60 flex items-center gap-1.5">
                  <Mail className="h-3 w-3" />
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2 text-sm text-ink outline-none transition-all focus:border-forest focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink/60 flex items-center gap-1.5">
                  <Lock className="h-3 w-3" />
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2 text-sm text-ink outline-none transition-all focus:border-forest focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex h-11 w-full items-center justify-center rounded-lg bg-forest text-sm font-semibold text-white tracking-wide transition-colors hover:bg-forest-light disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : authMode === "signin" ? (
                  "Sign In"
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>

            <div className="mt-5 border-t border-border pt-4 text-center">
              <button
                onClick={() => {
                  setAuthMode(authMode === "signin" ? "signup" : "signin");
                  setError("");
                }}
                className="text-xs font-semibold text-forest hover:underline"
              >
                {authMode === "signin"
                  ? "Don't have an account? Sign Up"
                  : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
