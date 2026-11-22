"use client";

import { useEffect, useRef, useState } from "react";
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
  Menu,
  X,
  MessageSquare,
  PanelTop,
  Scale,
  Briefcase,
  UserPlus,
  Building2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { handleLogout } from "@/lib/auth/auth.handlers";
import { WorkspaceSwitcher } from "@/components/workspace/WorkspaceSwitcher";
import { useGetMyProfileQuery } from "@/redux/api/authApi";
import BrandMark from "@/components/brand/BrandMark";
import { useWorkspace } from "@/context/WorkspaceContext";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
  workspaceKindLabel,
  workspaceRoleLabel,
} from "@/lib/workspaceUi";

export function MobSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { data: profile } = useGetMyProfileQuery(undefined);
  const role = (profile?.data as { role?: string } | undefined)?.role;
  const isPlatformAdmin = role === "admin" || role === "super_admin";
  const { canManage, canInvite, workspace, role: wsRole } = useWorkspace();

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
    { href: "/dashboard/workspace", label: "Settings", icon: Settings2 },
    { href: "/dashboard/plan", label: "Plan", icon: BadgeDollarSign },
  ];

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const onLogout = async () => {
    setLoggingOut(true);
    try {
      await handleLogout();
      setLogoutOpen(false);
      setIsOpen(false);
      toast.success("Logged out");
      router.replace("/login");
      router.refresh();
    } catch {
      toast.error("Log out failed");
    } finally {
      setLoggingOut(false);
    }
  };

  const KindIcon = workspace?.isPersonal ? UserRound : Building2;

  return (
    <div className="relative lg:hidden">
      <div className="safe-pt sticky top-0 z-30 border-b border-ink/10 bg-mist/95 backdrop-blur-md">
        <div className="flex items-center gap-2.5 px-3 py-2.5 sm:px-4">
          <BrandMark href="/dashboard/overview" size={30} showWordmark={false} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <KindIcon size={12} className="shrink-0 text-muted" />
              <p className="truncate text-sm font-semibold leading-tight text-ink">
                {workspace?.name || "Workspace"}
              </p>
            </div>
            <p className="truncate text-[10px] text-muted">
              {workspace
                ? `${workspaceKindLabel(workspace)} · ${workspaceRoleLabel(wsRole)}`
                : "Select a workspace"}
            </p>
          </div>
          <NotificationBell />
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-ink/15 bg-paper text-ink"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {isOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-ink/45 backdrop-blur-[1px]"
          aria-label="Close menu"
          onClick={() => setIsOpen(false)}
        />
      ) : null}

      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(100vw-2.75rem,20rem)] flex-col bg-ink text-paper shadow-[12px_0_40px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="safe-pt flex items-center justify-between px-4 pb-3 pt-4">
          <span className="font-display text-lg font-semibold">Menu</span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-2 px-3 pb-3">
          <WorkspaceSwitcher dark />
          {canInvite ? (
            <Link
              href="/dashboard/members?invite=1"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2.5 text-sm font-semibold text-accent-ink transition hover:bg-accent-deep"
            >
              <UserPlus size={16} />
              Invite member
            </Link>
          ) : null}
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain px-3 pb-3">
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
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-accent text-accent-ink"
                    : "text-white/75 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {label}
              </Link>
            );
          })}
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/75 hover:bg-white/5"
          >
            <LucideHome size={18} />
            Home
          </Link>
        </nav>

        <div className="safe-pb border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="flex w-full items-center gap-3 rounded-xl border border-white/10 px-3 py-3 text-sm font-medium text-white/80"
          >
            <LucideLogOut size={18} />
            Log out
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        onClose={() => {
          if (!loggingOut) setLogoutOpen(false);
        }}
        onConfirm={onLogout}
        title="Log out?"
        description="You will need to sign in again to open your board and workspaces."
        confirmLabel="Log out"
        cancelLabel="Stay signed in"
        danger
        busy={loggingOut}
      />
    </div>
  );
}

export default MobSidebar;
