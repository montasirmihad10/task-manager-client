"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ChevronDown,
  KeyRound,
  LogOut,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useGetUnreadCountQuery } from "@/redux/api/notificationApi";
import { useGetMyProfileQuery } from "@/redux/api/authApi";
import { getClientToken } from "@/lib/auth/cookies.client";
import { handleLogout } from "@/lib/auth/auth.handlers";
import {
  workspaceKindLabel,
  workspaceRoleLabel,
} from "@/lib/workspaceUi";

type ProfileUser = {
  name?: string;
  email?: string;
  profileImage?: string | { url?: string };
};

function avatarUrl(user?: ProfileUser | null): string | null {
  if (!user?.profileImage) return null;
  if (typeof user.profileImage === "string") return user.profileImage;
  return user.profileImage.url || null;
}

export function DashboardHeader() {
  const router = useRouter();
  const { workspace, role } = useWorkspace();
  const { data: profile } = useGetMyProfileQuery(undefined);
  const user = profile?.data as ProfileUser | undefined;
  const [hasToken, setHasToken] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasToken(Boolean(getClientToken()));
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const { data } = useGetUnreadCountQuery(undefined, { skip: !hasToken });
  const unread = (data?.data as { count?: number } | undefined)?.count ?? 0;

  const KindIcon = workspace?.isPersonal ? UserRound : Building2;
  const photo = avatarUrl(user);
  const label = user?.name || user?.email || "Account";
  const initial = label.trim().slice(0, 1).toUpperCase();

  const onLogout = async () => {
    setLoggingOut(true);
    try {
      await handleLogout();
      setLogoutOpen(false);
      setMenuOpen(false);
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
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-ink/10 bg-paper/80 px-4 py-2.5 backdrop-blur-sm md:px-6">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-mist text-ink sm:inline-flex">
          <KindIcon size={15} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">
            {workspace?.name || "Workspace"}
          </p>
          <p className="truncate text-[11px] text-muted">
            {workspace
              ? `${workspaceKindLabel(workspace)} · ${workspaceRoleLabel(role)}`
              : "Select a workspace"}
            {unread > 0 ? ` · ${unread} unread` : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/notifications"
          className="hidden rounded-xl px-2.5 py-1.5 text-xs font-semibold text-muted hover:bg-mist hover:text-ink sm:inline"
        >
          Inbox
        </Link>
        <NotificationBell />

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-1.5 rounded-xl border border-ink/10 bg-paper py-1 pl-1 pr-2 transition hover:border-ink/20 hover:bg-mist"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-mist text-xs font-semibold text-ink">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                initial
              )}
            </span>
            <span className="hidden max-w-[7.5rem] truncate text-xs font-semibold text-ink md:inline">
              {label}
            </span>
            <ChevronDown
              size={14}
              className={`text-muted transition ${menuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 z-[60] mt-2 w-52 overflow-hidden rounded-xl border border-ink/10 bg-paper shadow-[0_12px_40px_rgba(16,20,24,0.12)]"
            >
              <div className="border-b border-ink/8 px-3 py-2.5">
                <p className="truncate text-sm font-semibold text-ink">
                  {user?.name || "Your account"}
                </p>
                <p className="truncate text-xs text-muted">{user?.email}</p>
              </div>
              <Link
                href="/dashboard/account"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-sm text-ink hover:bg-mist"
              >
                <UserRound size={15} className="text-muted" />
                Profile
              </Link>
              <Link
                href="/dashboard/account#password"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-sm text-ink hover:bg-mist"
              >
                <KeyRound size={15} className="text-muted" />
                Change password
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  setLogoutOpen(true);
                }}
                className="flex w-full items-center gap-2 border-t border-ink/8 px-3 py-2.5 text-left text-sm text-signal hover:bg-signal/5"
              >
                <LogOut size={15} />
                Log out
              </button>
            </div>
          ) : null}
        </div>
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
    </header>
  );
}
