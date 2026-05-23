"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  X,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  showCloseButton = true,
  className,
}: ModalProps) {
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md transition-all duration-300 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup
          className={cn(
            "fixed top-[50%] left-[50%] z-50 w-full translate-x-[-50%] translate-y-[-50%] p-0 outline-none transition-all duration-300",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          )}
        >
          <div
            className={cn(
              "mx-auto w-[calc(100%-2rem)] rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900",
              sizeClasses[size],
              className,
            )}
          >
            {(title || description) && (
              <div className="flex flex-col gap-1.5 text-left mb-5 pr-8">
                {title && (
                  <DialogPrimitive.Title className="text-xl font-display font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                    {title}
                  </DialogPrimitive.Title>
                )}
                {description && (
                  <DialogPrimitive.Description className="text-sm text-slate-500 dark:text-slate-400">
                    {description}
                  </DialogPrimitive.Description>
                )}
              </div>
            )}

            {showCloseButton && (
              <DialogPrimitive.Close
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="absolute top-4 right-4 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={onClose}
                  />
                }
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            )}

            <div className="text-sm text-slate-600 dark:text-slate-300">
              {children}
            </div>

            {footer && (
              <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                {footer}
              </div>
            )}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export type ConfirmVariant =
  | "default"
  | "destructive"
  | "warning"
  | "success"
  | "info";

export interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  isAlert?: boolean;
}

type ConfirmContextType = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = React.createContext<ConfirmContextType | null>(null);

export function useConfirm() {
  const context = React.useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<{
    isOpen: boolean;
    options: ConfirmOptions | null;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    options: null,
    resolve: null,
  });

  const confirm = React.useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleClose = () => {
    setState((prev) => ({ ...prev, isOpen: false }));
    if (state.resolve) {
      setTimeout(() => state.resolve?.(false), 200);
    }
  };

  const handleConfirm = () => {
    setState((prev) => ({ ...prev, isOpen: false }));
    if (state.resolve) {
      setTimeout(() => state.resolve?.(true), 200);
    }
  };

  const handleCancel = () => {
    setState((prev) => ({ ...prev, isOpen: false }));
    if (state.resolve) {
      setTimeout(() => state.resolve?.(false), 200);
    }
  };

  const getVariantStyles = (variant: ConfirmVariant = "default") => {
    switch (variant) {
      case "destructive":
        return {
          icon: (
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          ),
          iconBg: "bg-red-50 dark:bg-red-950/30",
          barColor: "bg-red-500",
          confirmButtonClass:
            "bg-red-600 hover:bg-red-700 text-white border-transparent",
        };
      case "warning":
        return {
          icon: (
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          ),
          iconBg: "bg-amber-50 dark:bg-amber-950/30",
          barColor: "bg-amber-500",
          confirmButtonClass:
            "bg-amber-600 hover:bg-amber-700 text-white border-transparent",
        };
      case "success":
        return {
          icon: (
            <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          ),
          iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
          barColor: "bg-emerald-500",
          confirmButtonClass:
            "bg-forest hover:bg-forest-light text-white border-transparent",
        };
      case "info":
        return {
          icon: <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
          iconBg: "bg-blue-50 dark:bg-blue-950/30",
          barColor: "bg-blue-500",
          confirmButtonClass:
            "bg-blue-600 hover:bg-blue-700 text-white border-transparent",
        };
      default:
        return {
          icon: (
            <HelpCircleIcon className="h-6 w-6 text-forest dark:text-mint" />
          ),
          iconBg: "bg-mint/10 dark:bg-mint/5",
          barColor: "bg-forest",
          confirmButtonClass:
            "bg-forest hover:bg-forest-light text-white border-transparent",
        };
    }
  };

  const activeStyles = state.options
    ? getVariantStyles(state.options.variant)
    : null;
  const isAlert = state.options?.isAlert || !state.options?.cancelText;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <DialogPrimitive.Root
        open={state.isOpen}
        onOpenChange={(open) => !open && handleClose()}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md transition-all duration-300 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <DialogPrimitive.Popup
            className={cn(
              "fixed top-[50%] left-[50%] z-50 w-full translate-x-[-50%] translate-y-[-50%] p-0 outline-none transition-all duration-300",
              "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            )}
          >
            {state.options && activeStyles && (
              <div
                className={cn(
                  "mx-auto w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900",
                )}
              >
                <div className={cn("h-1.5 w-full", activeStyles.barColor)} />

                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "p-2 rounded-xl shrink-0",
                        activeStyles.iconBg,
                      )}
                    >
                      {activeStyles.icon}
                    </div>
                    <div className="space-y-1.5">
                      <DialogPrimitive.Title className="text-lg font-display font-bold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
                        {state.options.title}
                      </DialogPrimitive.Title>
                      <DialogPrimitive.Description className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pr-2">
                        {state.options.description}
                      </DialogPrimitive.Description>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                    {!isAlert && (
                      <Button
                        variant="outline"
                        size="default"
                        onClick={handleCancel}
                        className="w-full sm:w-auto font-semibold"
                      >
                        {state.options.cancelText || "Cancel"}
                      </Button>
                    )}
                    <Button
                      size="default"
                      onClick={handleConfirm}
                      className={cn(
                        "w-full sm:w-auto font-semibold shadow-sm",
                        activeStyles.confirmButtonClass,
                      )}
                    >
                      {state.options.confirmText ||
                        (isAlert ? "Dismiss" : "Confirm")}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </ConfirmContext.Provider>
  );
}

function HelpCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}
