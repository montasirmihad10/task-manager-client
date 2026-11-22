"use client";

import {
  ArrowLeft,
  ArrowRight,
  CalendarRange,
  GripVertical,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import {
  ITask,
  useUpdateBackStatusButtonMutation,
  useUpdateStatusButtonMutation,
} from "@/redux/api/taskApi";
import { dotFor, statusLabel, tintFor } from "@/lib/statusStyles";

type ToDoCardProps = {
  item: ITask;
  setActiveCard: (id: string | null) => void;
  isDragging?: boolean;
  onOpen?: () => void;
};

export default function ToDoCard({
  item,
  setActiveCard,
  isDragging,
  onOpen,
}: ToDoCardProps) {
  const { title, status, assignTo, start_date, end_date, _id } = item;
  const [updateStatusButton] = useUpdateStatusButtonMutation();
  const [updateBackStatusButton] = useUpdateBackStatusButtonMutation();

  const handleUpdateStatus = async (task: ITask) => {
    let updateStatus = "";
    if (task.status === "general") updateStatus = "backlog";
    else if (task.status === "backlog") updateStatus = "in-progress";
    else if (task.status === "in-progress") updateStatus = "paused";
    else if (task.status === "paused") updateStatus = "ready-to-launch";
    if (!updateStatus) return;

    const res = await updateStatusButton({ id: task._id, updateStatus });
    if (
      res?.data?.success ||
      (res?.data?.data as { modifiedCount?: number })?.modifiedCount
    ) {
      toast.success("Moved forward");
    }
  };

  const handleUpdateBackStatus = async (task: ITask) => {
    let updateBackStatus = "";
    if (task.status === "backlog") updateBackStatus = "general";
    else if (task.status === "in-progress") updateBackStatus = "backlog";
    else if (task.status === "paused") updateBackStatus = "in-progress";
    else if (task.status === "ready-to-launch") updateBackStatus = "paused";
    if (!updateBackStatus) return;

    const res = await updateBackStatusButton({
      id: task._id,
      updateBackStatus,
    });
    if (
      res?.data?.success ||
      (res?.data?.data as { modifiedCount?: number })?.modifiedCount
    ) {
      toast.success("Moved back");
    }
  };

  const canBack =
    status === "backlog" ||
    status === "in-progress" ||
    status === "paused" ||
    status === "ready-to-launch";
  const canForward =
    status === "general" ||
    status === "backlog" ||
    status === "in-progress" ||
    status === "paused";

  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", _id);
        e.dataTransfer.effectAllowed = "move";
        setActiveCard(_id);
      }}
      onDragEnd={() => setActiveCard(null)}
      onDoubleClick={() => onOpen?.()}
      className={`group relative cursor-grab rounded-xl border border-ink/10 bg-white p-3.5 shadow-[0_1px_0_rgba(16,20,24,0.04)] transition duration-200 active:cursor-grabbing ${
        isDragging
          ? "scale-[0.98] opacity-40 ring-2 ring-accent"
          : "hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-[0_12px_28px_rgba(16,20,24,0.1)]"
      }`}
    >
      <div className="mb-3 flex items-start gap-2">
        <span className="mt-0.5 text-ink/25 transition group-hover:text-ink/50">
          <GripVertical size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-2">
            <button
              type="button"
              onClick={() => onOpen?.()}
              className="text-left font-display text-[15px] font-semibold leading-snug text-ink hover:underline"
            >
              {title}
            </button>
            <span
              className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${tintFor(status)}`}
            >
              {statusLabel(status)}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-muted">
            <p className="flex items-center gap-1.5">
              <UserRound size={13} className="text-accent-deep" />
              <span className="font-medium text-ink">{assignTo}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <CalendarRange size={13} />
              <span>
                {start_date || "—"} → {end_date || "—"}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-ink/5 pt-2.5">
        <span className={`h-1.5 w-1.5 rounded-full ${dotFor(status)}`} />
        <div className="flex items-center gap-1.5">
          {canBack && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleUpdateBackStatus(item);
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-ink/10 bg-mist px-2 py-1 text-[11px] font-semibold text-ink transition hover:bg-paper"
            >
              <ArrowLeft size={12} />
              Back
            </button>
          )}
          {canForward && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleUpdateStatus(item);
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-ink px-2 py-1 text-[11px] font-semibold text-accent transition hover:bg-ink-soft"
            >
              Next
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
