"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarClock, CheckCircle2, User } from "lucide-react";
import {
  ITask,
  useFilterTasksQuery,
  useUpdateStatusMutation,
} from "@/redux/api/taskApi";
import { useGetWorkspaceStatusesQuery } from "@/redux/api/workspaceApi";
import { useWorkspace } from "@/context/WorkspaceContext";
import { extractList } from "@/lib/taskStats";
import { statusLabel, tintFor } from "@/lib/statusStyles";
import { apiErrorMessage, isApiSuccess } from "@/lib/apiError";
import { toast } from "sonner";

type DueTab = "all" | "overdue" | "week";

function dueIso(task: ITask) {
  if (task.dueDate) return String(task.dueDate).slice(0, 10);
  return task.end_date || "";
}

function isOverdue(task: ITask) {
  const d = dueIso(task);
  if (!d) return false;
  if (task.status === "ready-to-launch") return false;
  return new Date(d) < new Date(new Date().toDateString());
}

export default function MyWorkPage() {
  const { workspaceId, canManage } = useWorkspace();
  const [tab, setTab] = useState<DueTab>("all");
  const [updateStatus, { isLoading: moving }] = useUpdateStatusMutation();

  const { data, isLoading, isFetching } = useFilterTasksQuery(
    {
      workspaceId: workspaceId || "",
      mine: "true",
      ...(tab === "overdue" ? { due: "overdue" as const } : {}),
      ...(tab === "week" ? { due: "week" as const } : {}),
    },
    { skip: !workspaceId },
  );

  const { data: statusResult } = useGetWorkspaceStatusesQuery(
    workspaceId || "",
    { skip: !workspaceId },
  );
  const statuses = extractList<{ key: string; label: string }>(
    statusResult?.data ?? statusResult,
  );

  const tasks = useMemo(() => {
    const list = extractList<ITask>(data?.data ?? data);
    return [...list].sort((a, b) => {
      const da = dueIso(a) || "9999";
      const db = dueIso(b) || "9999";
      return da.localeCompare(db);
    });
  }, [data]);

  const overdueCount = tasks.filter(isOverdue).length;

  const move = async (task: ITask, status: string) => {
    const res = await updateStatus({ id: task._id, status });
    if (isApiSuccess(res)) toast.success("Status updated");
    else toast.error(apiErrorMessage(res, "Could not update status"));
  };

  if (!workspaceId) {
    return (
      <div className="px-4 py-6 text-sm text-muted md:px-8">
        Select a workspace to see your assigned work.
      </div>
    );
  }

  return (
    <div className="dash-enter px-3 py-4 sm:px-4 sm:py-6 md:px-8 md:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Focus
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            My work
          </h1>
          <p className="mt-1 text-sm text-muted">
            Tasks assigned to you in this workspace. Update status or open edit
            for details.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManage ? (
            <Link
              href="/dashboard/manage-tasks"
              className="rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-mist"
            >
              Team library
            </Link>
          ) : null}
          <Link
            href="/dashboard/todo-list"
            className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-accent hover:bg-ink-soft"
          >
            Open board
          </Link>
        </div>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {(
          [
            { id: "all", label: "All mine" },
            { id: "overdue", label: "Overdue" },
            { id: "week", label: "Due in 7 days" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
              tab === t.id
                ? "bg-ink text-accent"
                : "border border-ink/15 bg-white text-ink hover:bg-mist"
            }`}
          >
            {t.label}
            {t.id === "overdue" && overdueCount > 0 && tab === "all"
              ? ` (${overdueCount})`
              : ""}
          </button>
        ))}
        {isFetching ? (
          <span className="text-xs uppercase tracking-wide text-muted">
            Syncing…
          </span>
        ) : null}
      </div>

      {isLoading && !tasks.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-36 rounded-2xl" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/20 bg-white px-6 py-14 text-center">
          <CheckCircle2 className="mx-auto text-accent-deep" size={28} />
          <p className="mt-3 font-display text-lg font-semibold text-ink">
            Nothing in this view
          </p>
          <p className="mt-1 text-sm text-muted">
            When a manager assigns you work, it shows up here.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => {
            const overdue = isOverdue(task);
            const due = dueIso(task);
            return (
              <li
                key={task._id}
                className={`rounded-2xl border bg-white p-4 shadow-[0_8px_24px_rgba(16,20,24,0.04)] ${
                  overdue ? "border-signal/40" : "border-ink/10"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-display text-base font-semibold text-ink">
                    {task.title}
                  </h2>
                  {overdue ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-signal/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-signal">
                      <AlertTriangle size={12} />
                      Overdue
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tintFor(task.status)}`}
                  >
                    {statusLabel(task.status)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock size={12} />
                    {due || "No due date"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <User size={12} />
                    {task.priority || "medium"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/manage-tasks/edit-task/${task._id}`}
                    className="rounded-lg border border-ink/15 px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-mist"
                  >
                    Update
                  </Link>
                  <select
                    disabled={moving}
                    defaultValue=""
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v) void move(task, v);
                      e.target.value = "";
                    }}
                    className="rounded-lg border border-ink/15 bg-white px-2 py-1.5 text-xs font-semibold text-ink outline-none"
                  >
                    <option value="">Move status…</option>
                    {(statuses.length
                      ? statuses
                      : [
                          { key: "general", label: "General" },
                          { key: "backlog", label: "Backlog" },
                          { key: "in-progress", label: "In progress" },
                          { key: "paused", label: "Paused" },
                          { key: "ready-to-launch", label: "Ready" },
                        ]
                    ).map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label || statusLabel(s.key)}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
