import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { MobSidebar } from "@/components/mob-sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RequirePasswordChange } from "@/components/auth/RequirePasswordChange";

export default function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <RequirePasswordChange>
      <div className="flex h-dvh overflow-hidden bg-mist">
        <aside className="relative z-30 hidden h-full w-72 shrink-0 lg:block xl:w-80">
          <Sidebar />
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {/* Single mobile top chrome (menu + workspace + bell) */}
          <div className="relative z-40 shrink-0 lg:hidden">
            <MobSidebar />
          </div>
          {/* Desktop header only — avoids double bars on phones */}
          <div className="relative z-40 hidden lg:block">
            <DashboardHeader />
          </div>
          <main className="dash-outlet relative z-0 flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="h-full min-h-0 w-full max-w-full overflow-y-auto overflow-x-hidden overscroll-y-contain">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RequirePasswordChange>
  );
}
