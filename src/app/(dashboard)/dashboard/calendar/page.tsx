"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGetCalendarTasksQuery, type ITask } from "@/redux/api/taskApi";
import { useWorkspace } from "@/context/WorkspaceContext";
import { extractList } from "@/lib/taskStats";
import { statusLabel, tintFor } from "@/lib/statusStyles";
import TaskDetailDrawer from "@/components/todolist/task-detail-drawer";
import TodoModal from "@/components/todolist/todo-modal";

/** Calendar month helpers */
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysInGrid(month: Date) {
  const start = startOfMonth(month);
  const gridStart = new Date(start);
  gridStart.setDate(start.getDate() - start.getDay());
  const cells: Date[] = [];
  const cursor = new Date(gridStart);
  while (cells.length < 42) {
    cells.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return cells;
}

function taskDayKey(t: ITask) {
  if (t.dueDate) return String(t.dueDate).slice(0, 10);
  if (t.end_date) return String(t.end_date).slice(0, 10);
  return null;
}

function assigneeName(t: ITask) {
  if (t.assigneeId && typeof t.assigneeId === "object") {
    return t.assigneeId.name || t.assigneeId.email || t.assignTo;
  }
  return t.assignTo;
}

export default function CalendarPage() {
  const { workspaceId, workspace, canManage } = useWorkspace();
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => ymd(new Date()));
  const [detailId, setDetailId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [view, setView] = useState<"month" | "agenda">("month");

  const from = ymd(startOfMonth(cursor));
  const to = ymd(endOfMonth(cursor));

  const { data, isLoading, isError, refetch, isFetching } =
    useGetCalendarTasksQuery(
      { workspaceId: workspaceId || "", from, to },
      { skip: !workspaceId },
    );

  const tasks = useMemo(() => {
    const list = extractList<ITask>(data?.data ?? data);
    if (!statusFilter) return list;
    return list.filter((t) => t.status === statusFilter);
  }, [data, statusFilter]);

  const statuses = useMemo(() => {
    const set = new Set(extractList<ITask>(data?.data ?? data).map((t) => t.status));
    return Array.from(set);
  }, [data]);

  const byDay = useMemo(() => {
    const map = new Map<string, ITask[]>();
    tasks.forEach((t) => {
      const key = taskDayKey(t);
      if (!key) return;
      const list = map.get(key) || [];
      list.push(t);
      map.set(key, list);
    });
    return map;
  }, [tasks]);

  const cells = daysInGrid(cursor);
  const monthLabel = cursor.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });
  const selectedTasks = byDay.get(selectedDay) || [];
  const todayKey = ymd(new Date());
  const overdueCount = tasks.filter((t) => {
    const key = taskDayKey(t);
    return key && key < todayKey && t.status !== "ready-to-launch";
  }).length;

  const agendaGroups = useMemo(() => {
    const keys = Array.from(byDay.keys()).sort();
    return keys.map((key) => ({ key, items: byDay.get(key) || [] }));
  }, [byDay]);

  return (
    <div className="dash-enter flex h-full min-h-0 flex-col px-3 py-3 sm:px-4 sm:py-5 md:px-6">
      <div className="mb-4 flex shrink-0 flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Schedule
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink">
            Calendar
          </h1>
          {workspace ? (
            <p className="mt-1 text-sm text-muted">
              {workspace.name}
              {overdueCount > 0
                ? ` · ${overdueCount} overdue this month`
                : ""}
              {isFetching && !isLoading ? " · syncing" : ""}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-ink/15 bg-white p-0.5">
            {(["month", "agenda"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${
                  view === v
                    ? "bg-ink text-accent"
                    : "text-muted hover:text-ink"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-ink/15 bg-white px-3 py-2 text-xs font-semibold text-ink outline-none"
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              setCursor(startOfMonth(now));
              setSelectedDay(ymd(now));
            }}
            className="rounded-xl border border-ink/15 bg-white px-3 py-2 text-xs font-semibold text-ink hover:bg-mist"
          >
            Today
          </button>
          {canManage ? (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="rounded-xl bg-ink px-3 py-2 text-xs font-semibold text-accent"
            >
              Add task
            </button>
          ) : null}
        </div>
      </div>

      {!workspaceId ? (
        <p className="text-sm text-muted">Select a workspace first.</p>
      ) : isLoading ? (
        <div className="skeleton h-[520px] rounded-2xl" />
      ) : isError ? (
        <div className="rounded-2xl border border-signal/30 bg-signal/10 px-4 py-3 text-sm">
          Couldn’t load calendar.{" "}
          <button type="button" onClick={() => refetch()} className="underline">
            Retry
          </button>
        </div>
      ) : view === "agenda" ? (
        <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-ink/10 bg-white">
          {!agendaGroups.length ? (
            <p className="px-5 py-10 text-center text-sm text-muted">
              No dated tasks this month. Set an end/due date on tasks to see
              them here.
            </p>
          ) : (
            <ul className="divide-y divide-ink/10">
              {agendaGroups.map(({ key, items }) => (
                <li key={key} className="px-4 py-3 md:px-5">
                  <button
                    type="button"
                    onClick={() => setSelectedDay(key)}
                    className={`mb-2 text-left text-xs font-semibold uppercase tracking-wide ${
                      key === todayKey ? "text-signal" : "text-muted"
                    }`}
                  >
                    {new Date(key + "T12:00:00").toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                    {key === todayKey ? " · Today" : ""}
                    {key < todayKey ? " · Past" : ""}
                  </button>
                  <ul className="space-y-1.5">
                    {items.map((t) => (
                      <li key={t._id}>
                        <button
                          type="button"
                          onClick={() => setDetailId(t._id)}
                          className="flex w-full items-center gap-3 rounded-xl border border-ink/10 bg-mist/40 px-3 py-2 text-left hover:border-ink/20 hover:bg-mist"
                        >
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${tintFor(t.status)}`}
                          >
                            {statusLabel(t.status)}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                            {t.title}
                          </span>
                          <span className="hidden text-xs text-muted sm:inline">
                            {assigneeName(t)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_300px]">
          <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white">
            <div className="flex shrink-0 items-center justify-between border-b border-ink/10 px-3 py-2">
              <button
                type="button"
                onClick={() =>
                  setCursor(
                    new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1),
                  )
                }
                className="rounded-lg p-2 hover:bg-mist"
                aria-label="Previous month"
              >
                <ChevronLeft size={18} />
              </button>
              <p className="font-display text-lg font-semibold text-ink">
                {monthLabel}
              </p>
              <button
                type="button"
                onClick={() =>
                  setCursor(
                    new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1),
                  )
                }
                className="rounded-lg p-2 hover:bg-mist"
                aria-label="Next month"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="grid grid-cols-7 border-b border-ink/10 bg-ink text-[10px] font-semibold tracking-wide text-accent uppercase sm:text-[11px]">
              {(
                [
                  ["S", "Sun"],
                  ["M", "Mon"],
                  ["T", "Tue"],
                  ["W", "Wed"],
                  ["T", "Thu"],
                  ["F", "Fri"],
                  ["S", "Sat"],
                ] as const
              ).map(([short, full]) => (
                <div key={full} className="px-0.5 py-2 text-center sm:px-1">
                  <span className="sm:hidden">{short}</span>
                  <span className="hidden sm:inline">{full}</span>
                </div>
              ))}
            </div>
            <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6">
              {cells.map((day) => {
                const key = ymd(day);
                const inMonth = day.getMonth() === cursor.getMonth();
                const dayTasks = byDay.get(key) || [];
                const isToday = key === todayKey;
                const isSelected = key === selectedDay;
                const hasOverdue =
                  key < todayKey &&
                  dayTasks.some((t) => t.status !== "ready-to-launch");
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDay(key)}
                    className={`min-h-[64px] min-w-0 overflow-hidden border-t border-r border-ink/10 p-1 text-left transition last:border-r-0 sm:min-h-[72px] ${
                      isSelected
                        ? "bg-accent/25"
                        : inMonth
                          ? "bg-white hover:bg-mist/80"
                          : "bg-mist/40"
                    }`}
                  >
                    <span
                      className={`mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        isToday
                          ? "bg-ink text-accent"
                          : hasOverdue
                            ? "text-signal"
                            : inMonth
                              ? "text-ink"
                              : "text-muted"
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    <div className="min-w-0 space-y-0.5">
                      {dayTasks.slice(0, 2).map((t) => (
                        <span
                          key={t._id}
                          className="block truncate rounded px-1 text-[10px] font-medium text-ink"
                          title={t.title}
                        >
                          {t.title}
                        </span>
                      ))}
                      {dayTasks.length > 2 ? (
                        <span className="px-1 text-[10px] text-muted">
                          +{dayTasks.length - 2}
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white">
            <div className="border-b border-ink/10 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Day panel
              </p>
              <h2 className="mt-0.5 font-display text-lg font-bold text-ink">
                {new Date(selectedDay + "T12:00:00").toLocaleDateString(
                  undefined,
                  {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  },
                )}
              </h2>
              <p className="text-xs text-muted">
                {selectedTasks.length} task
                {selectedTasks.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
              {!selectedTasks.length ? (
                <p className="px-1 py-6 text-center text-sm text-muted">
                  Nothing due this day. Click another date or add a task with a
                  due/end date.
                </p>
              ) : (
                selectedTasks.map((t) => (
                  <button
                    key={t._id}
                    type="button"
                    onClick={() => setDetailId(t._id)}
                    className="w-full rounded-xl border border-ink/10 bg-mist/50 px-3 py-2.5 text-left transition hover:border-ink/25 hover:bg-mist"
                  >
                    <p className="truncate text-sm font-semibold text-ink">
                      {t.title}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                      <span
                        className={`rounded px-1.5 py-0.5 font-bold uppercase ${tintFor(t.status)}`}
                      >
                        {statusLabel(t.status)}
                      </span>
                      <span>{assigneeName(t)}</span>
                      {t.priority ? <span>· {t.priority}</span> : null}
                    </p>
                  </button>
                ))
              )}
            </div>
          </aside>
        </div>
      )}

      <TaskDetailDrawer taskId={detailId} onClose={() => setDetailId(null)} />
      <TodoModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        modalStatus="general"
        workspaceId={workspaceId}
        defaultEndDate={selectedDay}
      />
    </div>
  );
}
