"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, MessageSquare, Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
import {
  type ITaskDetail,
  useAddCommentMutation,
  useAddSubtaskMutation,
  useGetTaskDetailQuery,
  useUpdateSubtaskMutation,
} from "@/redux/api/taskApi";
import { useUploadDocumentMutation } from "@/redux/api/documentApi";
import { useOpenDirectChatMutation } from "@/redux/api/chatApi";
import { useGetMyProfileQuery } from "@/redux/api/authApi";
import { useWorkspace } from "@/context/WorkspaceContext";
import { statusLabel } from "@/lib/statusStyles";
import { apiErrorMessage, isApiSuccess } from "@/lib/apiError";

type Props = {
  taskId: string | null;
  onClose: () => void;
};

export default function TaskDetailDrawer({ taskId, onClose }: Props) {
  const router = useRouter();
  const { workspaceId } = useWorkspace();
  const { data: profile } = useGetMyProfileQuery(undefined);
  const myId = (profile?.data as { _id?: string } | undefined)?._id;
  const { data, isLoading, isFetching } = useGetTaskDetailQuery(taskId || "", {
    skip: !taskId,
  });
  const [addComment] = useAddCommentMutation();
  const [addSubtask] = useAddSubtaskMutation();
  const [updateSubtask] = useUpdateSubtaskMutation();
  const [uploadDocument, { isLoading: uploading }] =
    useUploadDocumentMutation();
  const [openChat, { isLoading: openingChat }] = useOpenDirectChatMutation();
  const [comment, setComment] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  if (!taskId) return null;

  const detail = (data?.data ?? null) as ITaskDetail | null;
  const task = detail?.task;
  const assigneeId =
    typeof task?.assigneeId === "object" && task?.assigneeId
      ? task.assigneeId._id
      : typeof task?.assigneeId === "string"
        ? task.assigneeId
        : "";

  const onComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const res = await addComment({ id: taskId, body: comment.trim() });
    if (isApiSuccess(res)) {
      toast.success("Comment added");
      setComment("");
    } else {
      toast.error(apiErrorMessage(res, "Could not add comment"));
    }
  };

  const onSubtask = async (e: FormEvent) => {
    e.preventDefault();
    if (!subTitle.trim()) return;
    const res = await addSubtask({ id: taskId, title: subTitle.trim() });
    if (isApiSuccess(res)) {
      toast.success("Checklist item added");
      setSubTitle("");
    } else {
      toast.error(apiErrorMessage(res, "Could not add checklist item"));
    }
  };

  const onUpload = async (file: File | null | undefined) => {
    if (!file) return;
    if (!workspaceId) {
      toast.error("Select a workspace first");
      return;
    }
    const res = await uploadDocument({
      file,
      workspaceId,
      taskId,
      name: file.name,
    });
    if (isApiSuccess(res)) {
      toast.success("File uploaded");
      if (fileRef.current) fileRef.current.value = "";
    } else {
      toast.error(apiErrorMessage(res, "Upload failed"));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40 backdrop-blur-[1px]">
      <button
        type="button"
        className="hidden h-full flex-1 cursor-default sm:block"
        aria-label="Close detail"
        onClick={onClose}
      />
      <aside className="flex h-full w-full max-w-none flex-col border-l border-ink/10 bg-paper shadow-[-20px_0_50px_rgba(16,20,24,0.18)] sm:max-w-md">
        <div className="safe-pt flex items-start justify-between gap-3 border-b border-ink/10 px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Task detail
            </p>
            <h2 className="mt-1 font-display text-xl font-bold text-ink">
              {task?.title || (isLoading ? "Loading…" : "Task")}
            </h2>
            {task ? (
              <p className="mt-1 text-xs text-muted">
                {statusLabel(task.status)} · {task.assignTo}
                {isFetching ? " · syncing" : ""}
              </p>
            ) : null}
            {assigneeId && assigneeId !== myId && workspaceId ? (
              <button
                type="button"
                disabled={openingChat}
                onClick={async () => {
                  const res = await openChat({
                    workspaceId,
                    recipientId: assigneeId,
                  });
                  if (isApiSuccess(res)) {
                    const id = (res.data?.data as { _id?: string } | undefined)
                      ?._id;
                    onClose();
                    router.push(
                      id
                        ? `/dashboard/messages?c=${id}`
                        : "/dashboard/messages",
                    );
                  } else {
                    toast.error(apiErrorMessage(res, "Could not open chat"));
                  }
                }}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-ink px-2.5 py-1.5 text-xs font-semibold text-accent disabled:opacity-60"
              >
                <MessageSquare size={14} />
                Message assignee
              </button>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-muted hover:bg-mist hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="hide-scrollbar min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          {task?.description ? (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                Description
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-ink">
                {task.description}
              </p>
            </section>
          ) : null}

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                Checklist
              </h3>
              <span className="text-[11px] text-muted">
                {detail?.checklist?.done || 0}/{detail?.checklist?.total || 0}
              </span>
            </div>
            <ul className="space-y-2">
              {(detail?.subtasks || []).map((s) => (
                <li key={s._id}>
                  <button
                    type="button"
                    onClick={async () => {
                      await updateSubtask({
                        id: taskId,
                        subtaskId: s._id,
                        isDone: !s.isDone,
                      });
                    }}
                    className="flex w-full items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2 text-left text-sm transition hover:border-ink/20"
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-md ${
                        s.isDone
                          ? "bg-accent-deep text-white"
                          : "border border-ink/20 bg-mist"
                      }`}
                    >
                      {s.isDone ? <Check size={12} /> : null}
                    </span>
                    <span
                      className={
                        s.isDone ? "text-muted line-through" : "text-ink"
                      }
                    >
                      {s.title}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <form onSubmit={onSubtask} className="mt-2 flex gap-2">
              <input
                value={subTitle}
                onChange={(e) => setSubTitle(e.target.value)}
                placeholder="Add checklist item"
                className="flex-1 rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
              />
              <button
                type="submit"
                className="rounded-xl bg-ink px-3 text-accent"
                aria-label="Add subtask"
              >
                <Plus size={16} />
              </button>
            </form>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Comments
            </h3>
            <div className="space-y-2">
              {(detail?.comments || []).map((c) => (
                <div
                  key={c._id}
                  className="rounded-xl border border-ink/10 bg-white px-3 py-2.5"
                >
                  <p className="text-[11px] font-semibold text-ink">
                    {c.authorId?.name || c.authorId?.email || "Member"}
                  </p>
                  <p className="mt-1 text-sm text-ink/90">{c.body}</p>
                </div>
              ))}
            </div>
            <form onSubmit={onComment} className="mt-2 space-y-2">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Write a comment… use @email to mention"
                className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
              />
              <button
                type="submit"
                className="rounded-xl bg-ink px-3 py-2 text-xs font-semibold text-accent"
              >
                Post comment
              </button>
            </form>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Activity
            </h3>
            <ul className="space-y-2">
              {(detail?.activity || []).slice(0, 12).map((a) => (
                <li
                  key={a._id}
                  className="rounded-lg bg-mist/80 px-3 py-2 text-xs text-muted"
                >
                  <span className="font-medium text-ink">
                    {a.actorId?.name || a.actorId?.email || "Someone"}
                  </span>{" "}
                  · {a.action.replace(/_/g, " ")}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Files
            </h3>
            <ul className="mb-3 space-y-1">
              {(detail?.documents || []).map((d) => (
                <li key={d._id}>
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-accent-deep hover:underline"
                  >
                    {d.name}
                  </a>
                </li>
              ))}
              {!detail?.documents?.length ? (
                <li className="text-sm text-muted">No files yet</li>
              ) : null}
            </ul>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => void onUpload(e.target.files?.[0])}
            />
            <button
              type="button"
              disabled={uploading || !workspaceId}
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-ink/15 bg-white px-3 py-2 text-xs font-semibold text-ink transition hover:bg-mist disabled:opacity-60"
            >
              <Upload size={14} />
              {uploading ? "Uploading…" : "Upload file"}
            </button>
          </section>
        </div>
      </aside>
    </div>
  );
}
