import { RefreshCw, Plane, Loader2 } from "lucide-react";

interface LoadingScreenProps {
  variant?: "spinner" | "plane" | "loader";
  minHeight?: string;
  className?: string;
  message?: string;
}

export function LoadingScreen({
  variant = "spinner",
  minHeight = "min-h-screen",
  className = "",
  message,
}: LoadingScreenProps) {
  return (
    <div
      className={`flex items-center justify-center bg-slate-50/50 ${minHeight} ${className}`}
    >
      <div className="flex flex-col items-center gap-3">
        {variant === "spinner" && (
          <RefreshCw className="h-8 w-8 text-forest animate-spin" />
        )}
        {variant === "plane" && (
          <Plane className="h-8 w-8 text-forest animate-spin" />
        )}
        {variant === "loader" && (
          <Loader2 className="h-8 w-8 text-forest animate-spin" />
        )}
        {message && (
          <p className="text-xs font-semibold text-ink/50">{message}</p>
        )}
      </div>
    </div>
  );
}
