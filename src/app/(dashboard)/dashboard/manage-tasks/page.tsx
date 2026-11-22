"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Download, Timer, User } from "lucide-react";
import { toast } from "sonner";
import Search from "@/components/dashboard/search";
import Filter from "@/components/dashboard/filter";
import UseTable from "@/components/ui/UseTable";
import UsePagination from "@/components/ui/UsePagination";
import {
  ITask,
  useBulkUpdateTasksMutation,
  useDeleteTaskMutation,
  useFilterTasksQuery,
  useSearchFilterTasksQuery,
} from "@/redux/api/taskApi";
import { useGetMyProfileQuery } from "@/redux/api/authApi";
import { statusLabel, tintFor } from "@/lib/statusStyles";
import { useWorkspace } from "@/context/WorkspaceContext";
import { apiErrorMessage, isApiSuccess } from "@/lib/apiError";
import { exportTasksCsv } from "@/lib/exportTasksCsv";
import { extractList } from "@/lib/taskStats";

const PAGE_SIZE = 8;

const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

type TeamView = "all" | "overdue" | "week" | "mine";

function assigneeIdOf(task: ITask): string {
  if (!task.assigneeId) return "";
  if (typeof task.assigneeId === "object") return task.assigneeId._id || "";
  return String(task.assigneeId);
}

function ManageTasksPageInner() {
  const { data: profileResult } = useGetMyProfileQuery(undefined);
  const user = profileResult?.data as
    | { email?: string; _id?: string }
    | undefined;
  const { workspaceId, canManage } = useWorkspace();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [teamView, setTeamView] = useState<TeamView>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkPriority, setBulkPriority] = useState("");
  const [deleteTask] = useDeleteTaskMutation();
  const [bulkUpdate, { isLoading: bulkLoading }] = useBulkUpdateTasksMutation();

  useEffect(() => {
    const view = searchParams.get("view");
    if (view === "overdue" || view === "week" || view === "mine" || view === "all") {
      setTeamView(view);
      setPage(1);
    }
  }, [searchParams]);

  const useAdvanced =
    Boolean(workspaceId) && (teamView !== "all" || Boolean(search));

  const { data: filterResult, isLoading, isFetching, refetch } =
    useSearchFilterTasksQuery(
      {
        status: status || undefined,
        title: search || undefined,
        email: workspaceId ? undefined : user?.email,
        workspaceId: workspaceId || undefined,
      },
      { skip: !workspaceId && !user?.email || useAdvanced },
    );

  const {
    data: advancedResult,
    isLoading: advLoading,
    isFetching: advFetching,
    refetch: refetchAdv,
  } = useFilterTasksQuery(
    {
      workspaceId: workspaceId || "",
      status: status || undefined,
      search: search || undefined,
      ...(teamView === "overdue" ? { due: "overdue" as const } : {}),
      ...(teamView === "week" ? { due: "week" as const } : {}),
      ...(teamView === "mine" ? { mine: "true" } : {}),
    },
    { skip: !useAdvanced || !workspaceId },
  );

  const payload = filterResult?.data as
    | { tasks?: string[]; result?: ITask[] }
    | undefined;

  const tasksFilter = useMemo(() => payload?.tasks || [], [payload?.tasks]);

  const data = useMemo(() => {
    if (useAdvanced) {
      return extractList<ITask>(advancedResult?.data ?? advancedResult);
    }
    return payload?.result || [];
  }, [useAdvanced, advancedResult, payload?.result]);

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const pageData = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageIds = pageData.map((t) => t._id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const value = (form.elements.namedItem("search") as HTMLInputElement).value;
    setSearch(value);
    setPage(1);
    form.reset();
  };

  const handleReset = () => {
    setStatus("");
    setSearch("");
    setTeamView("all");
    setPage(1);
    setSelected(new Set());
    if (useAdvanced) void refetchAdv();
    else void refetch();
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePage = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const runBulk = async (patch: {
    status?: string;
    priority?: string;
    archive?: boolean;
  }) => {
    if (!workspaceId) {
      toast.error("Select a workspace first");
      return;
    }
    const taskIds = Array.from(selected);
    if (!taskIds.length) return;
    const res = await bulkUpdate({
      workspaceId,
      taskIds,
      ...patch,
    });
    if (isApiSuccess(res)) {
      const modified = (res.data?.data as { modifiedCount?: number })
        ?.modifiedCount;
      toast.success(
        modified != null
          ? `Updated ${modified} task${modified === 1 ? "" : "s"}`
          : "Bulk update applied",
      );
      setSelected(new Set());
      setBulkStatus("");
      setBulkPriority("");
    } else {
      toast.error(apiErrorMessage(res, "Bulk update failed"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!canManage) {
      toast.error("Only managers and admins can remove tasks");
      return;
    }
    const ok = window.confirm("Remove this task? This cannot be undone.");
    if (!ok) return;
    const res = await deleteTask(id);
    if (isApiSuccess(res)) {
      toast.success("Task removed");
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      toast.error(apiErrorMessage(res, "Could not remove task"));
    }
  };

  const handleExport = async () => {
    if (!workspaceId) return;
    try {
      await exportTasksCsv(workspaceId);
      toast.success("CSV downloaded");
    } catch {
      toast.error("Export failed");
    }
  };

  const canEditRow = (task: ITask) => {
    if (canManage) return true;
    if (!user?._id) return false;
    return assigneeIdOf(task) === user._id;
  };

  const columns = [
    ...(canManage && workspaceId
      ? [
          {
            key: "select",
            title: (
              <input
                type="checkbox"
                checked={allPageSelected}
                onChange={togglePage}
                aria-label="Select page"
                className="h-4 w-4 accent-accent-deep"
              />
            ),
            width: 44,
            render: (task: ITask) => (
              <input
                type="checkbox"
                checked={selected.has(task._id)}
                onChange={() => toggleOne(task._id)}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Select ${task.title}`}
                className="h-4 w-4 accent-accent-deep"
              />
            ),
          },
        ]
      : []),
    {
      key: "title",
      title: "Title",
      render: (task: ITask) => (
        <span className="font-medium text-ink">{task.title}</span>
      ),
    },
    {
      key: "assignTo",
      title: "Assigned",
      render: (task: ITask) => (
        <span className="inline-flex items-center gap-1.5 text-muted">
          <User size={14} className="text-accent-deep" />
          {task.assignTo || "—"}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (task: ITask) => (
        <span
          className={`rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${tintFor(task.status)}`}
        >
          {statusLabel(task.status)}
        </span>
      ),
    },
    {
      key: "start_date",
      title: "Start",
      render: (task: ITask) => (
        <span className="inline-flex items-center gap-1.5 text-muted">
          <Timer size={14} />
          {task.start_date}
        </span>
      ),
    },
    {
      key: "end_date",
      title: "Due",
      render: (task: ITask) => (
        <span className="inline-flex items-center gap-1.5 text-muted">
          <Timer size={14} />
          {task.dueDate
            ? String(task.dueDate).slice(0, 10)
            : task.end_date}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (task: ITask) => (
        <div className="flex flex-wrap gap-2">
          {canEditRow(task) ? (
            <>
              <Link
                href={`/dashboard/manage-tasks/edit-task/${task._id}`}
                className="rounded-lg border border-ink/15 px-2.5 py-1.5 text-xs font-semibold text-ink transition hover:border-ink/30 hover:bg-mist"
              >
                Edit
              </Link>
              {canManage ? (
                <button
                  type="button"
                  onClick={() => handleDelete(task._id)}
                  className="rounded-lg bg-signal px-2.5 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                >
                  Remove
                </button>
              ) : null}
            </>
          ) : (
            <span className="text-xs text-muted">View only</span>
          )}
        </div>
      ),
    },
  ];

  const loading =
    (useAdvanced ? advLoading || advFetching : isLoading || isFetching) &&
    !data.length;

  return (
    <div className="dash-enter px-3 py-4 sm:px-4 sm:py-6 md:px-8 md:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {canManage ? "Team library" : "Library"}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {canManage ? "Manage tasks" : "All tasks"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {canManage
              ? "Filter overdue work, bulk-update, and keep the pipeline clear."
              : "Browse the board library. Edit tasks assigned to you."}
          </p>
        </div>
        <Link
          href="/dashboard/my-work"
          className="rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-mist"
        >
          My work
        </Link>
      </div>

      {canManage && workspaceId ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {(
            [
              { id: "all", label: "All tasks" },
              { id: "overdue", label: "Overdue" },
              { id: "week", label: "Due this week" },
              { id: "mine", label: "Assigned to me" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTeamView(t.id);
                setPage(1);
              }}
              className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                teamView === t.id
                  ? "bg-ink text-accent"
                  : "border border-ink/15 bg-white text-ink hover:bg-mist"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Search handleSearch={handleSearch} />
        <div className="flex flex-wrap items-center gap-2">
          <Filter
            tasksFilter={tasksFilter}
            status={status}
            setStatus={(value) => {
              setStatus(value);
              setPage(1);
            }}
            handleReset={handleReset}
          />
          {workspaceId ? (
            <button
              type="button"
              onClick={() => void handleExport()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm font-semibold text-ink hover:bg-mist"
            >
              <Download size={14} />
              Export CSV
            </button>
          ) : null}
        </div>
      </div>

      {canManage && workspaceId && selected.size > 0 ? (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-ink/10 bg-ink px-3 py-2.5 text-paper">
          <p className="mr-1 text-xs font-semibold tracking-wide uppercase text-accent">
            {selected.size} selected
          </p>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="rounded-lg border border-white/15 bg-white/10 px-2 py-1.5 text-xs text-paper outline-none"
          >
            <option value="" className="text-ink">
              Set status…
            </option>
            {(tasksFilter.length
              ? tasksFilter
              : [
                  "general",
                  "backlog",
                  "in-progress",
                  "paused",
                  "ready-to-launch",
                ]
            ).map((s) => (
              <option key={s} value={s} className="text-ink">
                {statusLabel(s)}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!bulkStatus || bulkLoading}
            onClick={() => void runBulk({ status: bulkStatus })}
            className="rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-accent-ink disabled:opacity-50"
          >
            Apply status
          </button>
          <select
            value={bulkPriority}
            onChange={(e) => setBulkPriority(e.target.value)}
            className="rounded-lg border border-white/15 bg-white/10 px-2 py-1.5 text-xs text-paper outline-none"
          >
            <option value="" className="text-ink">
              Set priority…
            </option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p} className="text-ink">
                {p}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!bulkPriority || bulkLoading}
            onClick={() => void runBulk({ priority: bulkPriority })}
            className="rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-accent-ink disabled:opacity-50"
          >
            Apply priority
          </button>
          <button
            type="button"
            disabled={bulkLoading}
            onClick={() => {
              if (
                window.confirm(
                  `Archive ${selected.size} selected task${selected.size === 1 ? "" : "s"}?`,
                )
              ) {
                void runBulk({ archive: true });
              }
            }}
            className="rounded-lg border border-white/20 px-2.5 py-1.5 text-xs font-semibold text-paper hover:bg-white/10"
          >
            Archive
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white/70 hover:text-white"
          >
            Clear
          </button>
        </div>
      ) : null}

      <UseTable<ITask>
        loading={loading}
        data={pageData}
        emptyText="No tasks match this filter"
        columns={columns}
        rowClassName={(task) =>
          selected.has(task._id) ? "bg-accent/20" : ""
        }
      />

      <UsePagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        showFirstLast
      />
    </div>
  );
}

export default function ManageTasksPage() {
  return (
    <Suspense
      fallback={
        <div className="px-3 py-4 text-sm text-muted sm:px-4 sm:py-6 md:px-8">
          Loading tasks…
        </div>
      }
    >
      <ManageTasksPageInner />
    </Suspense>
  );
}
