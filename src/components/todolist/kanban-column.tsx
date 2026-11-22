"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import ToDoCard from "./todo-card";
import type { ITask, TTaskStatus } from "@/redux/api/taskApi";
import { columnAccentFor, dotFor } from "@/lib/statusStyles";

type KanbanColumnProps = {
  title: string;
  status: TTaskStatus;
  color?: string;
  tasks: ITask[];
  activeCard: string | null;
  setActiveCard: (id: string | null) => void;
  onDrop: (status: TTaskStatus, taskId: string | null) => void;
  openModal: (status: string) => void;
  onOpenTask?: (task: ITask) => void;
  canAdd?: boolean;
};

export default function KanbanColumn({
  title,
  status,
  color,
  tasks,
  activeCard,
  setActiveCard,
  onDrop,
  openModal,
  onOpenTask,
  canAdd = true,
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!isOver) setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);
    const fromData = e.dataTransfer.getData("text/plain") || null;
    onDrop(status, fromData || activeCard);
  };

  return (
    <section
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex h-full min-h-0 w-[min(85vw,280px)] shrink-0 flex-col overflow-hidden rounded-2xl border transition duration-200 lg:w-auto lg:min-w-0 lg:flex-1 ${
        isOver
          ? "border-accent-deep bg-accent/20 shadow-[inset_0_0_0_1px_rgba(155,196,26,0.4)]"
          : "border-ink/10 bg-paper/90"
      }`}
    >
      <div
        className={`relative shrink-0 border-b border-ink/10 bg-gradient-to-b px-3.5 py-3 ${columnAccentFor(status)}`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${dotFor(status)}`}
              style={color ? { backgroundColor: color } : undefined}
            />
            <h2 className="truncate font-display text-sm font-semibold text-ink">
              {title}
            </h2>
          </div>
          <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[11px] font-bold text-ink">
            {tasks.length}
          </span>
        </div>
      </div>

      {canAdd ? (
        <button
          type="button"
          onClick={() => openModal(status)}
          className="mx-3 mt-3 flex shrink-0 items-center justify-center gap-2 rounded-xl border border-dashed border-ink/20 bg-white/70 px-3 py-2.5 text-xs font-semibold text-ink transition hover:border-accent-deep hover:bg-accent/20"
        >
          <Plus size={14} />
          Add task
        </button>
      ) : null}

      <div className="hide-scrollbar mt-3 flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-3 pb-3">
        {isOver && (
          <div className="flex h-12 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-accent-deep bg-accent/30 text-xs font-semibold text-accent-ink">
            Drop anywhere in this column
          </div>
        )}

        {tasks.length > 0 ? (
          tasks.map((item) => (
            <ToDoCard
              key={item._id}
              item={item}
              setActiveCard={setActiveCard}
              isDragging={activeCard === item._id}
              onOpen={() => onOpenTask?.(item)}
            />
          ))
        ) : (
          !isOver && (
            <div className="flex h-28 shrink-0 items-center justify-center rounded-xl border border-dashed border-ink/15 text-center text-xs leading-relaxed text-muted">
              Drop cards anywhere
              <br />
              in this column
            </div>
          )
        )}

        <div className="min-h-[120px] flex-1 rounded-xl" aria-hidden />
      </div>
    </section>
  );
}
