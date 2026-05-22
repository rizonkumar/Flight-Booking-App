"use client";

import React from "react";
import { ConfirmProvider } from "@/components/ui/modal";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ConfirmProvider>{children}</ConfirmProvider>;
}
