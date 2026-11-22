"use client";

import Link from "next/link";
import { Building2, UserRound } from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useGetUnreadCountQuery } from "@/redux/api/notificationApi";
import { getClientToken } from "@/lib/auth/cookies.client";
import {
  workspaceKindLabel,
  workspaceRoleLabel,
} from "@/lib/workspaceUi";
import { useEffect, useState } from "react";

export function DashboardHeader() {
  const { workspace, role } = useWorkspace();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(Boolean(getClientToken()));
  }, []);

  const { data } = useGetUnreadCountQuery(undefined, { skip: !hasToken });
  const unread = (data?.data as { count?: number } | undefined)?.count ?? 0;

  const KindIcon = workspace?.isPersonal ? UserRound : Building2;

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
      </div>
    </header>
  );
}
