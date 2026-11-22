import type { ReactNode } from "react";

/** Public marketing surface — landing only, no site navbar. */
export default function PublicLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <>{children}</>;
}
