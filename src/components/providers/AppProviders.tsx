"use client";

import type { ReactNode } from "react";
import { ReduxProvider } from "@/redux/ReduxProvider";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { Toaster } from "sonner";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider>
      <WorkspaceProvider>
        <Toaster position="top-right" richColors />
        {children}
      </WorkspaceProvider>
    </ReduxProvider>
  );
}
