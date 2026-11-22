"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ListChecks,
  ClipboardList,
  LucideHome,
  LucideLogOut,
  Users2Icon,
  SquareChartGantt,
  CalendarDays,
  FolderKanban,
  Settings2,
  BadgeDollarSign,
  Bell,
  MessageSquare,
  PanelTop,
  Scale,
  Briefcase,
  UserPlus,
  UserRound,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { toast } from "sonner";
import { handleLogout } from "@/lib/auth/auth.handlers";
import { WorkspaceSwitcher } from "@/components/workspace/WorkspaceSwitcher";
import { useGetBillingStatusQuery } from "@/redux/api/workspaceApi";
import { useGetMyProfileQuery } from "@/redux/api/authApi";
import BrandMark from "@/components/brand/BrandMark";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: profile } = useGetMyProfileQuery(undefined);
  const role = (profile?.data as { role?: string } | undefined)?.role;
  const isPlatformAdmin = role === "admin" || role === "super_admin";
  const { canManage, canInvite } = useWorkspace();
  const { data: billing } = useGetBillingStatusQuery(undefined);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const links = [
    { href: "/dashboard/overview", label: "Overview", icon: SquareChartGantt },
    { href: "/dashboard/my-work", label: "My work", icon: Briefcase },
    { href: "/dashboard/todo-list", label: "Board", icon: ListChecks },
    { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
    { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
    {
      href: "/dashboard/manage-tasks",
      label: canManage ? "Manage" : "All tasks",
      icon: ClipboardList,
    },
    { href: "/dashboard/members", label: "Members", icon: Users2Icon },
    { href: "/dashboard/notifications", label: "Inbox", icon: Bell },
    { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
    { href: "/dashboard/workspace", label: "Workspace", icon: Settings2 },
    { href: "/dashboard/account", label: "Account", icon: UserRound },
    { href: "/dashboard/plan", label: "Plan", icon: BadgeDollarSign },
  ];
  const planLabel =
    (billing?.data as { currentPlan?: string; isFreeProduct?: boolean } | undefined)
      ?.isFreeProduct !== false
      ? "Free forever"
      : "Plan";

  const onLogout = async () => {
    setLoggingOut(true);
    try {
      await handleLogout();
      setLogoutOpen(false);
      toast.success("Logged out");
      router.replace("/login");
      router.refresh();
    } catch {
      toast.error("Log out failed");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <aside className="flex h-full w-full flex-col border-r border-white/10 bg-ink text-paper">
      <div className="flex shrink-0 items-center gap-2.5 px-5 py-5">
        <BrandMark
          href="/dashboard/overview"
          dark={true}
          showWordmark={false}
          size={36}
        />
        <div className="min-w-0">
          <p className="truncate font-display text-base font-semibold leading-none">
            Planboard
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/45">
            {planLabel}
          </p>
        </div>
      </div>

      <div className="relative z-20 shrink-0 space-y-2 px-3 pb-3">
        <WorkspaceSwitcher dark />
        {canInvite ? (
          <Link
            href="/dashboard/members?invite=1"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2.5 text-sm font-semibold text-accent-ink transition hover:bg-accent-deep"
          >
            <UserPlus size={16} />
            Invite member
          </Link>
        ) : null}
      </div>

      <nav className="hide-scrollbar flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 pb-3">
        {[
          ...links,
          ...(isPlatformAdmin
            ? [
                {
                  href: "/dashboard/admin/landing",
                  label: "Landing CMS",
                  icon: PanelTop,
                },
                {
                  href: "/dashboard/admin/legal",
                  label: "Legal docs",
                  icon: Scale,
                },
              ]
            : []),
        ].map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              data-active={active}
              className={`nav-ink-link flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition duration-200 ${
                active
                  ? "bg-accent text-accent-ink shadow-[0_0_0_1px_rgba(200,245,66,0.35)]"
                  : "text-white/75 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}

        <div className="my-3 h-px shrink-0 bg-white/10" />

        <Link
          href="/"
          className="nav-ink-link flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/5 hover:text-white"
        >
          <LucideHome size={18} className="shrink-0" />
          Home
        </Link>
      </nav>

      <div className="shrink-0 border-t border-white/10 p-3">
        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className="flex w-full items-center gap-3 rounded-md border border-white/10 px-3 py-2.5 text-sm font-medium text-white/80 transition hover:border-signal/50 hover:bg-signal/10 hover:text-white"
        >
          <LucideLogOut size={18} />
          Log out
        </button>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        onClose={() => (!loggingOut ? setLogoutOpen(false) : undefined)}
        onConfirm={onLogout}
        title="Log out?"
        description="You will need to sign in again to open your board and workspaces."
        confirmLabel="Log out"
        cancelLabel="Stay signed in"
        danger
        busy={loggingOut}
      />
    </aside>
  );
}

export default Sidebar;
