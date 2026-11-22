import type { ReactNode } from "react";
import BrandMark from "@/components/brand/BrandMark";

export default function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-mist">
      <div className="home-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -left-20 top-10 h-48 w-48 rounded-full bg-accent/20 blur-3xl sm:h-64 sm:w-64" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-signal/15 blur-3xl sm:h-72 sm:w-72" />

      <div className="relative mx-auto flex min-h-dvh max-w-6xl flex-col px-4 py-6 sm:px-5 sm:py-8 md:px-8">
        <div className="mb-6 self-start sm:mb-8">
          <BrandMark href="/" size={36} />
        </div>
        <div className="flex flex-1 items-start justify-center pb-8 sm:items-center sm:pb-10">
          <div className="w-full max-w-lg">{children}</div>
        </div>
      </div>
    </div>
  );
}
