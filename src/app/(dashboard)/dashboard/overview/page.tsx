"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  FolderKanban,
  Layers3,
  LoaderCircle,
  Pause,
  Rocket,
} from "lucide-react";
import Charts from "@/components/dashboard/charts";
import { useGetTaskStatsQuery } from "@/redux/api/taskApi";
import {
  useGetBillingStatusQuery,
  useGetPlatformSummaryQuery,
  useGetWorkspaceSummaryQuery,
} from "@/redux/api/workspaceApi";
import { useWorkspace } from "@/context/WorkspaceContext";
import { STATUS_STAT_BG, statusLabel } from "@/lib/statusStyles";
import { normalizeTaskStats } from "@/lib/taskStats";
import {
  workspaceKindLabel,
  workspaceRoleLabel,
} from "@/lib/workspaceUi";

const ICONS: Record<string, ReactNode> = {
  general: <FolderKanban size={18} />,
  backlog: <Layers3 size={18} />,
  "in-progress": <LoaderCircle size={18} />,
  paused: <Pause size={18} />,
  "ready-to-launch": <Rocket size={18} />,
};

export default function OverviewPage() {
  const { workspaceId, workspace, role, canManage, isPlatformAdmin } =
    useWorkspace();
  const { data: billingResult } = useGetBillingStatusQuery(undefined);
  const billing = billingResult?.data as
    | { isFreeProduct?: boolean; currentPlan?: string }
    | undefined;

  const { data: platformResult, isLoading: platformLoading } =
    useGetPlatformSummaryQuery(undefined, { skip: !isPlatformAdmin });

  const { data: summaryResult, isLoading: summaryLoading } =
    useGetWorkspaceSummaryQuery(workspaceId || "", {
      skip: !workspaceId || isPlatformAdmin,
    });

  const { data: statsResult, isLoading, isError, isFetching, refetch } =
    useGetTaskStatsQuery(
      isPlatformAdmin
        ? { scope: "platform" }
        : workspaceId
          ? { workspaceId, scope: "workspace" }
          : undefined,
      {
        skip: !isPlatformAdmin && !workspaceId,
        refetchOnMountOrArgChange: true,
      },
    );

  const platform = platformResult?.data as
    | {
        counts?: {
          totalTasks?: number;
          overdue?: number;
          dueThisWeek?: number;
          projects?: number;
          workspaces?: number;
          users?: number;
        };
      }
    | undefined;

  const summary = summaryResult?.data as
    | {
        counts?: {
          totalTasks?: number;
          myTasks?: number;
          overdue?: number;
          dueThisWeek?: number;
          projects?: number;
        };
      }
    | undefined;

  const taskStats = normalizeTaskStats(statsResult?.data ?? statsResult);
  const total =
    (isPlatformAdmin
      ? platform?.counts?.totalTasks
      : summary?.counts?.totalTasks) ??
    taskStats.reduce((sum, s) => sum + (s.count || 0), 0);
  const showSkeleton =
    (isLoading || summaryLoading || platformLoading) && !statsResult;

  return (
    <div className="dash-enter px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6">
      <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {isPlatformAdmin ? "Platform · " : "Dashboard · "}
            {billing?.isFreeProduct !== false
              ? "Free forever"
              : billing?.currentPlan || "Plan"}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {isPlatformAdmin ? "Admin overview" : "Overview"}
          </h1>
          {isPlatformAdmin ? (
            <p className="mt-1 truncate text-sm text-muted">
              All workspaces · product-wide pipeline and accounts
            </p>
          ) : workspace ? (
            <p className="mt-1 truncate text-sm text-muted">
              {workspace.name}
              {" · "}
              {workspaceKindLabel(workspace)}
              {role ? ` · ${workspaceRoleLabel(role)}` : ""}
            </p>
          ) : null}
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
          <Link
            href="/dashboard/my-work"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm font-semibold text-ink hover:bg-mist sm:px-4"
          >
            My work
          </Link>
          {canManage ? (
            <Link
              href="/dashboard/manage-tasks?view=overdue"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-signal/30 bg-signal/10 px-3 py-2.5 text-sm font-semibold text-ink hover:bg-signal/15 sm:px-4"
            >
              Overdue
            </Link>
          ) : null}
          <Link
            href="/dashboard/todo-list"
            className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-3 py-2.5 text-sm font-semibold text-accent transition hover:bg-ink-soft sm:col-span-1 sm:px-4"
          >
            Open board
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-ink/10 bg-white px-4 py-3.5 text-sm text-muted">
        {isPlatformAdmin ? (
          <p>
            <span className="font-semibold text-ink">Platform administrator</span>{" "}
            — charts and totals include every workspace. Managers and members
            only see data inside workspaces they belong to.
          </p>
        ) : workspace?.isPersonal ? (
          <p>
            <span className="font-semibold text-ink">Personal workspace</span> —
            your private board. Create a{" "}
            <span className="font-semibold text-ink">team workspace</span> as a
            manager when you need to invite people and assign work.
          </p>
        ) : canManage ? (
          <p>
            <span className="font-semibold text-ink">Team workspace</span> — you
            manage this space. Invite members, assign tasks, and track overdue
            work. Members focus on what you assign them in My work.
          </p>
        ) : (
          <p>
            You’re viewing{" "}
            <span className="font-semibold text-ink">{workspace?.name}</span> as
            a <span className="font-semibold text-ink">member</span>. Open{" "}
            <Link
              href="/dashboard/my-work"
              className="font-semibold text-ink underline decoration-ink/20 underline-offset-2 hover:decoration-ink"
            >
              My work
            </Link>{" "}
            for tasks assigned to you, or the board for the shared pipeline.
          </p>
        )}
      </div>

      {isError && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-signal/30 bg-signal/10 px-4 py-3 text-sm text-ink">
          <p>Couldn’t load stats. Check that you’re signed in and the API is up.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-accent hover:bg-ink-soft"
          >
            Retry
          </button>
        </div>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(isPlatformAdmin
          ? [
              {
                label: "All tasks",
                value: total,
                hint: "Every workspace",
                href: "/dashboard/manage-tasks",
              },
              {
                label: "Workspaces",
                value: platform?.counts?.workspaces ?? "—",
                hint: "Active spaces",
                href: "/dashboard/workspace",
              },
              {
                label: "Users",
                value: platform?.counts?.users ?? "—",
                hint: "Accounts",
                href: "/dashboard/members",
              },
              {
                label: "Overdue",
                value: platform?.counts?.overdue ?? "—",
                hint: "Across product",
                href: "/dashboard/manage-tasks?view=overdue",
              },
            ]
          : [
              {
                label: "In pipeline",
                value: total,
                hint: "All stages",
                href: "/dashboard/todo-list",
              },
              {
                label: "Assigned to me",
                value: summary?.counts?.myTasks ?? "—",
                hint: "Your tasks",
                href: "/dashboard/my-work",
              },
              {
                label: "Overdue",
                value: summary?.counts?.overdue ?? "—",
                hint: canManage ? "Team past due" : "Your past due",
                href: canManage
                  ? "/dashboard/manage-tasks?view=overdue"
                  : "/dashboard/my-work",
              },
              {
                label: "Due this week",
                value: summary?.counts?.dueThisWeek ?? "—",
                hint: "Next 7 days",
                href: canManage
                  ? "/dashboard/manage-tasks?view=week"
                  : "/dashboard/my-work",
              },
            ]
        ).map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-2xl border border-ink/10 bg-white p-4 shadow-[0_8px_24px_rgba(16,20,24,0.04)] transition hover:border-ink/25 hover:shadow-[0_12px_28px_rgba(16,20,24,0.07)]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              {item.label}
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-ink">
              {showSkeleton ? "—" : item.value}
            </p>
            <p className="mt-1 text-xs text-muted">{item.hint}</p>
          </Link>
        ))}
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {showSkeleton
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-[104px] rounded-2xl" />
            ))
          : taskStats.map((task) => (
              <div
                key={task._id}
                className="stat-card group rounded-2xl border border-ink/10 bg-white p-4 shadow-[0_8px_24px_rgba(16,20,24,0.03)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                      {statusLabel(String(task._id))}
                    </p>
                    <p className="mt-2 font-display text-3xl font-bold text-ink">
                      {task.count}
                    </p>
                  </div>
                  <span
                    className={`stat-icon flex h-9 w-9 items-center justify-center rounded-xl text-white transition group-hover:scale-110 ${
                      STATUS_STAT_BG[task._id] || "bg-ink"
                    }`}
                  >
                    {ICONS[task._id] || <FolderKanban size={18} />}
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-mist">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      STATUS_STAT_BG[task._id] || "bg-ink"
                    }`}
                    style={{
                      width: `${total ? Math.max(8, (task.count / total) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
      </div>

      {isFetching ? (
        <p className="mb-3 text-[11px] uppercase tracking-wide text-accent-deep">
          Syncing…
        </p>
      ) : null}

      <Charts workspaceId={workspaceId} platformScope={isPlatformAdmin} />
    </div>
  );
}
