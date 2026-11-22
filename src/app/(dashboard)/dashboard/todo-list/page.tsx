"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import TodoModal from "@/components/todolist/todo-modal";
import KanbanColumn from "@/components/todolist/kanban-column";
import TaskDetailDrawer from "@/components/todolist/task-detail-drawer";
import {
  ITask,
  TTaskStatus,
  useGetWorkspaceTasksQuery,
  useUpdateStatusMutation,
} from "@/redux/api/taskApi";
import { useGetWorkspaceStatusesQuery } from "@/redux/api/workspaceApi";
import { useWorkspace } from "@/context/WorkspaceContext";
import { extractList } from "@/lib/taskStats";
import { toast } from "sonner";

const FALLBACK_COLUMNS = [
  { key: "general", label: "General", color: "#8b95a1" },
  { key: "backlog", label: "Backlog", color: "#3d8fd1" },
  { key: "in-progress", label: "In progress", color: "#e0a800" },
  { key: "paused", label: "Paused", color: "#ff6b3d" },
  { key: "ready-to-launch", label: "Ready to launch", color: "#9bc41a" },
];

function TodoListPageInner() {
  const { workspaceId, workspace, canManage, isLoading: wsLoading } =
    useWorkspace();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState("general");
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [updateStatus] = useUpdateStatusMutation();

  useEffect(() => {
    const taskParam = searchParams.get("task");
    if (taskParam) setDetailId(taskParam);
  }, [searchParams]);

  const { data: statusesResult, isLoading: statusLoading } =
    useGetWorkspaceStatusesQuery(workspaceId || "", { skip: !workspaceId });
  const { data: tasksResult, isLoading: tasksLoading } =
    useGetWorkspaceTasksQuery(workspaceId || "", { skip: !workspaceId });

  const statuses = useMemo(() => {
    const list = extractList<{
      key: string;
      label: string;
      color: string;
      order: number;
    }>(statusesResult?.data ?? statusesResult);
    if (!list.length) return FALLBACK_COLUMNS;
    return [...list].sort((a, b) => a.order - b.order);
  }, [statusesResult]);

  const tasks = useMemo(
    () => extractList<ITask>(tasksResult?.data ?? tasksResult),
    [tasksResult],
  );

  const byStatus = useMemo(() => {
    const map: Record<string, ITask[]> = {};
    statuses.forEach((s) => {
      map[s.key] = [];
    });
    tasks.forEach((task) => {
      if (!map[task.status]) map[task.status] = [];
      map[task.status].push(task);
    });
    return map;
  }, [tasks, statuses]);

  const openModal = (status: string) => {
    setModalStatus(status);
    setIsModalOpen(true);
  };

  const onDrop = async (status: TTaskStatus, taskId: string | null) => {
    const id = taskId || activeCard;
    if (!id) return;

    const current = tasks.find((t) => t._id === id);
    if (!current || current.status === status) {
      setActiveCard(null);
      return;
    }

    const res = await updateStatus({ id, status });
    if (res?.data?.success || res?.data?.data) {
      toast.success(`Moved to ${status.replace(/-/g, " ")}`);
    }
    setActiveCard(null);
  };

  const isLoading = wsLoading || (!!workspaceId && (statusLoading || tasksLoading));

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-3 py-3 sm:px-4 sm:py-4 md:px-5 md:py-5">
      <div className="mb-3 flex shrink-0 flex-wrap items-end justify-between gap-3 sm:mb-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Workflow
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
            Board
          </h1>
          {workspace ? (
            <p className="mt-1 truncate text-sm text-muted">{workspace.name}</p>
          ) : null}
        </div>
        <p className="w-full rounded-xl border border-ink/10 bg-white/80 px-3 py-2 text-xs text-muted sm:w-auto md:text-sm">
          <span className="sm:hidden">Swipe columns · tap a card for detail.</span>
          <span className="hidden sm:inline">
            Drag onto{" "}
            <span className="font-semibold text-ink">any part</span> of a column.
            Double-click a card for detail.
          </span>
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {!workspaceId ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-ink/15 px-4 text-center text-sm text-muted">
            Select or create a workspace to open the board.
          </div>
        ) : isLoading ? (
          <div className="hide-scrollbar flex h-full gap-3 overflow-x-auto">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="skeleton h-full min-h-[60dvh] w-[min(85vw,280px)] shrink-0 rounded-2xl"
              />
            ))}
          </div>
        ) : (
          <div className="hide-scrollbar snap-x-board flex h-full min-h-0 gap-3 overflow-x-auto overflow-y-hidden pb-2">
            {statuses.map((col) => (
              <KanbanColumn
                key={col.key}
                status={col.key}
                title={col.label}
                color={col.color}
                tasks={byStatus[col.key] || []}
                activeCard={activeCard}
                setActiveCard={setActiveCard}
                onDrop={onDrop}
                openModal={openModal}
                onOpenTask={(task) => setDetailId(task._id)}
                canAdd={canManage}
              />
            ))}
          </div>
        )}
      </div>

      <TodoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalStatus={modalStatus}
        workspaceId={workspaceId}
      />

      <TaskDetailDrawer
        taskId={detailId}
        onClose={() => setDetailId(null)}
      />
    </div>
  );
}

export default function TodoListPage() {
  return (
    <Suspense
      fallback={
        <div className="grid h-full grid-cols-1 gap-3 p-4 md:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-full min-h-[420px] rounded-2xl" />
          ))}
        </div>
      }
    >
      <TodoListPageInner />
    </Suspense>
  );
}
