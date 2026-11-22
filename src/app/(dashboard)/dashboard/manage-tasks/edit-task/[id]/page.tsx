"use client";

import { use, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Loading from "@/components/loading";
import {
  ITask,
  TTaskStatus,
  useEditTaskMutation,
  useFindTaskQuery,
} from "@/redux/api/taskApi";
import { useGetMyProfileQuery } from "@/redux/api/authApi";
import {
  useGetWorkspaceMembersQuery,
  useGetWorkspaceStatusesQuery,
} from "@/redux/api/workspaceApi";
import { useGetProjectsQuery } from "@/redux/api/projectApi";
import { useWorkspace } from "@/context/WorkspaceContext";
import { extractList } from "@/lib/taskStats";
import { apiErrorMessage, isApiSuccess } from "@/lib/apiError";
import { statusLabel } from "@/lib/statusStyles";

type EditForm = {
  title: string;
  assignTo: string;
  assigneeId?: string;
  status: TTaskStatus;
  start_date: string;
  end_date: string;
  dueDate?: string;
  description?: string;
  priority?: string;
  projectId?: string;
  estimateHours?: string;
};

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/40 focus:ring-2 focus:ring-accent/40";

function assigneeIdOf(task: ITask | undefined): string {
  if (!task?.assigneeId) return "";
  if (typeof task.assigneeId === "object") return task.assigneeId._id || "";
  return String(task.assigneeId);
}

export default function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { workspaceId, canManage, canAssign } = useWorkspace();
  const { data: profileResult } = useGetMyProfileQuery(undefined);
  const myId = (profileResult?.data as { _id?: string } | undefined)?._id;
  const { data: taskResult, isLoading } = useFindTaskQuery(id);
  const task = taskResult?.data as ITask | undefined;
  const [editTask, { isLoading: saving }] = useEditTaskMutation();
  const { register, handleSubmit, reset, setValue, watch } =
    useForm<EditForm>();

  const { data: statusResult } = useGetWorkspaceStatusesQuery(
    workspaceId || "",
    { skip: !workspaceId },
  );
  const { data: membersResult } = useGetWorkspaceMembersQuery(
    workspaceId || "",
    { skip: !workspaceId || !canAssign },
  );
  const { data: projectsResult } = useGetProjectsQuery(workspaceId || "", {
    skip: !workspaceId,
  });

  const statuses = extractList<{ key: string; label: string }>(
    statusResult?.data ?? statusResult,
  );
  const members = extractList<{
    userId: { _id: string; name?: string; email: string } | string;
  }>(membersResult?.data ?? membersResult)
    .map((m) => (typeof m.userId === "object" ? m.userId : null))
    .filter(Boolean) as { _id: string; name?: string; email: string }[];
  const projects = extractList<{ _id: string; name: string }>(
    projectsResult?.data ?? projectsResult,
  );

  const isOwnTask = useMemo(() => {
    if (!task || !myId) return false;
    const assignee = assigneeIdOf(task);
    const created =
      task.createdBy != null ? String(task.createdBy) : "";
    return assignee === myId || created === myId;
  }, [task, myId]);

  const canEdit = canManage || isOwnTask;
  const memberMode = !canManage && isOwnTask;

  const watchedAssignee = watch("assigneeId");

  useEffect(() => {
    if (!watchedAssignee || !canAssign) return;
    const m = members.find((x) => x._id === watchedAssignee);
    if (m) setValue("assignTo", m.name || m.email);
  }, [watchedAssignee, members, setValue, canAssign]);

  useEffect(() => {
    if (task) {
      const due = task.dueDate
        ? String(task.dueDate).slice(0, 10)
        : task.end_date;
      reset({
        title: task.title,
        assignTo: task.assignTo,
        assigneeId: assigneeIdOf(task),
        status: task.status,
        start_date: task.start_date,
        end_date: task.end_date,
        dueDate: due,
        description: task.description || "",
        priority: task.priority || "medium",
        projectId:
          typeof task.projectId === "string" ? task.projectId : "",
        estimateHours:
          task.estimateHours != null ? String(task.estimateHours) : "",
      });
    }
  }, [task, reset]);

  useEffect(() => {
    if (isLoading || !task) return;
    if (!canEdit) {
      toast.error("You can only edit tasks assigned to you");
      router.replace("/dashboard/my-work");
    }
  }, [canEdit, isLoading, task, router]);

  const onSubmit = async (data: EditForm) => {
    const ok = window.confirm("Save changes to this task?");
    if (!ok) return;
    const end = data.dueDate || data.end_date;
    const res = await editTask({
      id,
      title: data.title,
      assignTo: canAssign ? data.assignTo : undefined,
      assigneeId: canAssign ? data.assigneeId || null : undefined,
      status: data.status,
      start_date: data.start_date,
      end_date: end,
      dueDate: end,
      description: data.description,
      priority: data.priority as ITask["priority"],
      projectId: canAssign ? data.projectId || null : undefined,
      estimateHours: data.estimateHours
        ? Number(data.estimateHours)
        : null,
    });
    if (isApiSuccess(res)) {
      toast.success("Task updated");
    } else {
      toast.error(apiErrorMessage(res, "Failed to update task"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!canEdit) return null;

  const backHref = memberMode
    ? "/dashboard/my-work"
    : "/dashboard/manage-tasks";

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {memberMode ? "My task" : "Edit"}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink">
            {memberMode ? "Update your work" : "Update task"}
          </h1>
        </div>
        <Link
          href={backHref}
          className="rounded-xl border border-ink/15 px-3 py-2 text-sm font-semibold text-ink hover:bg-paper"
        >
          Back
        </Link>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-2xl space-y-4 rounded-2xl border border-ink/10 bg-paper p-6 md:p-8"
      >
        <div>
          <label className="text-sm font-medium text-ink">Title</label>
          <input {...register("title")} className={fieldClass} />
        </div>

        <div>
          <label className="text-sm font-medium text-ink">Description</label>
          <textarea
            rows={3}
            {...register("description")}
            className={fieldClass}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-ink">Assign to</label>
            {canAssign && members.length ? (
              <select {...register("assigneeId")} className={fieldClass}>
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name || m.email}
                  </option>
                ))}
              </select>
            ) : (
              <input
                {...register("assignTo")}
                disabled={memberMode}
                className={`${fieldClass} disabled:bg-mist disabled:text-muted`}
              />
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Status</label>
            <select {...register("status")} className={fieldClass}>
              {(statuses.length
                ? statuses
                : [
                    { key: "general", label: "General" },
                    { key: "backlog", label: "Backlog" },
                    { key: "in-progress", label: "In progress" },
                    { key: "paused", label: "Paused" },
                    { key: "ready-to-launch", label: "Ready to launch" },
                  ]
              ).map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label || statusLabel(s.key)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-ink">Priority</label>
            <select {...register("priority")} className={fieldClass}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Project</label>
            <select
              {...register("projectId")}
              disabled={memberMode}
              className={`${fieldClass} disabled:bg-mist disabled:text-muted`}
            >
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
            <label className="text-sm font-medium text-ink">Start date</label>
            <input
              type="date"
              {...register("start_date")}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Due date</label>
            <input type="date" {...register("dueDate")} className={fieldClass} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-ink">
            Estimate (hours)
          </label>
          <input
            type="number"
            min={0}
            step={0.5}
            {...register("estimateHours")}
            className={fieldClass}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-accent transition hover:bg-ink-soft disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
