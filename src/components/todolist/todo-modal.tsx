"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAddTaskMutation } from "@/redux/api/taskApi";
import { useGetMyProfileQuery } from "@/redux/api/authApi";
import { useGetWorkspaceMembersQuery } from "@/redux/api/workspaceApi";
import { useGetProjectsQuery } from "@/redux/api/projectApi";
import { useGetLabelsQuery } from "@/redux/api/labelApi";
import { useWorkspace } from "@/context/WorkspaceContext";
import { extractList } from "@/lib/taskStats";
import { apiErrorMessage, isApiSuccess } from "@/lib/apiError";

type TodoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  modalStatus: string;
  workspaceId?: string | null;
  /** Prefill end/due date (YYYY-MM-DD) e.g. from calendar */
  defaultEndDate?: string;
};

type TaskForm = {
  title: string;
  assignTo: string;
  assigneeId?: string;
  status: string;
  start_date: string;
  end_date: string;
  dueDate?: string;
  description?: string;
  priority?: string;
  projectId?: string;
  estimateHours?: string;
  labelIds?: string[];
};

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/40 focus:ring-2 focus:ring-accent/40";

type MemberUser = {
  _id: string;
  name?: string;
  email: string;
};

export default function TodoModal({
  isOpen,
  onClose,
  modalStatus,
  workspaceId,
  defaultEndDate,
}: TodoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { canAssign } = useWorkspace();
  const [addTask, { isLoading }] = useAddTaskMutation();
  const { data: profileResult } = useGetMyProfileQuery(undefined);
  const user = profileResult?.data as
    | { email?: string; _id?: string; name?: string }
    | undefined;
  const [taskStatus, setTaskStatus] = useState("");

  const { data: membersResult } = useGetWorkspaceMembersQuery(
    workspaceId || "",
    { skip: !workspaceId || !isOpen },
  );
  const { data: projectsResult } = useGetProjectsQuery(workspaceId || "", {
    skip: !workspaceId || !isOpen,
  });
  const { data: labelsResult } = useGetLabelsQuery(workspaceId || "", {
    skip: !workspaceId || !isOpen,
  });

  const members = extractList<{
    userId: MemberUser | string;
  }>(membersResult?.data ?? membersResult)
    .map((m) => (typeof m.userId === "object" ? m.userId : null))
    .filter(Boolean) as MemberUser[];

  const projects = extractList<{ _id: string; name: string }>(
    projectsResult?.data ?? projectsResult,
  );
  const labels = extractList<{ _id: string; name: string; color: string }>(
    labelsResult?.data ?? labelsResult,
  );

  useEffect(() => {
    setTaskStatus(modalStatus);
  }, [modalStatus]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<TaskForm>({
    defaultValues: {
      title: "",
      assignTo: "",
      assigneeId: "",
      status: taskStatus || "general",
      start_date: "",
      end_date: defaultEndDate || "",
      dueDate: defaultEndDate || "",
      description: "",
      priority: "medium",
      projectId: "",
      estimateHours: "",
    },
  });

  const assigneeId = watch("assigneeId");
  const selectedLabels = watch("labelIds") || [];

  useEffect(() => {
    if (!assigneeId) return;
    const m = members.find((x) => x._id === assigneeId);
    if (m) setValue("assignTo", m.name || m.email);
  }, [assigneeId, members, setValue]);

  const onSubmit = async (data: TaskForm) => {
    const today = new Date().toISOString().slice(0, 10);
    const end = data.end_date || data.dueDate || today;
    const task = {
      userEmail: user?.email || "",
      title: data.title,
      assignTo: data.assignTo || user?.name || user?.email || "Unassigned",
      assigneeId: canAssign ? data.assigneeId || undefined : user?._id,
      status: data.status,
      start_date: data.start_date || today,
      end_date: end,
      dueDate: data.dueDate || end,
      description: data.description || "",
      priority: data.priority || "medium",
      projectId: data.projectId || undefined,
      estimateHours: data.estimateHours
        ? Number(data.estimateHours)
        : undefined,
      labelIds: data.labelIds?.length ? data.labelIds : undefined,
      workspaceId: workspaceId || undefined,
      createdBy: user?._id,
    };
    const res = await addTask(task);
    if (isApiSuccess(res)) {
      toast.success("Task added");
      reset();
      onClose();
    } else {
      toast.error(apiErrorMessage(res, "Could not add task"));
    }
  };

  useEffect(() => {
    if (modalStatus) setValue("status", modalStatus);
  }, [modalStatus, setValue]);

  useEffect(() => {
    if (defaultEndDate) {
      setValue("end_date", defaultEndDate);
      setValue("dueDate", defaultEndDate);
    }
  }, [defaultEndDate, setValue, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4 backdrop-blur-[2px]">
      <div
        ref={modalRef}
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-ink/10 bg-paper p-6 shadow-[0_24px_60px_rgba(16,20,24,0.28)] md:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl p-1.5 text-muted transition hover:bg-mist hover:text-ink"
        >
          <X size={20} />
        </button>

        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          New work
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold text-ink">
          Add task
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label htmlFor="title" className="text-sm font-medium text-ink">
              Title
            </label>
            <input
              type="text"
              id="title"
              placeholder="What needs to happen?"
              {...register("title", { required: "Title is required" })}
              className={fieldClass}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-signal">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="text-sm font-medium text-ink"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={2}
              placeholder="Optional details"
              {...register("description")}
              className={fieldClass}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="assigneeId"
                className="text-sm font-medium text-ink"
              >
                Assign to
              </label>
              {canAssign && members.length ? (
                <select
                  id="assigneeId"
                  {...register("assigneeId")}
                  className={fieldClass}
                >
                  <option value="">Select member</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name || m.email}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={user?.name || user?.email || "You"}
                  readOnly
                  className={`${fieldClass} cursor-not-allowed bg-paper-deep`}
                />
              )}
            </div>
            <div>
              <label htmlFor="priority" className="text-sm font-medium text-ink">
                Priority
              </label>
              <select id="priority" {...register("priority")} className={fieldClass}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="status" className="text-sm font-medium text-ink">
                Status
              </label>
              <input
                type="text"
                id="status"
                defaultValue={taskStatus || "general"}
                {...register("status")}
                readOnly
                className={`${fieldClass} cursor-not-allowed bg-paper-deep`}
              />
            </div>
            <div>
              <label htmlFor="projectId" className="text-sm font-medium text-ink">
                Project
              </label>
              <select id="projectId" {...register("projectId")} className={fieldClass}>
                <option value="">None</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="start_date"
                className="text-sm font-medium text-ink"
              >
                Start date
              </label>
              <input
                type="date"
                id="start_date"
                {...register("start_date")}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="dueDate" className="text-sm font-medium text-ink">
                Due date
              </label>
              <input
                type="date"
                id="dueDate"
                {...register("dueDate")}
                className={fieldClass}
                onChange={(e) => {
                  setValue("dueDate", e.target.value);
                  setValue("end_date", e.target.value);
                }}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="estimateHours"
              className="text-sm font-medium text-ink"
            >
              Estimate (hours)
            </label>
            <input
              type="number"
              min={0}
              step={0.5}
              id="estimateHours"
              {...register("estimateHours")}
              className={fieldClass}
              placeholder="Optional"
            />
          </div>

          {labels.length ? (
            <div>
              <p className="text-sm font-medium text-ink">Labels</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {labels.map((l) => {
                  const checked = selectedLabels.includes(l._id);
                  return (
                    <label
                      key={l._id}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        checked
                          ? "border-ink bg-ink text-accent"
                          : "border-ink/15 bg-white text-ink"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() => {
                          const next = checked
                            ? selectedLabels.filter((id) => id !== l._id)
                            : [...selectedLabels, l._id];
                          setValue("labelIds", next);
                        }}
                      />
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: l.color }}
                      />
                      {l.name}
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-ink/15 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-mist"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-accent hover:bg-ink-soft disabled:opacity-60"
            >
              {isLoading ? "Adding…" : "Add task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
