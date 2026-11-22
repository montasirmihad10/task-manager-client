import type { ReactNode } from "react";
import { Suspense } from "react";

export default function MessagesLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <Suspense fallback={<div className="skeleton m-6 h-64 rounded-2xl" />}>{children}</Suspense>;
}
