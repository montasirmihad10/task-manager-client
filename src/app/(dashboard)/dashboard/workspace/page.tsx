"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useCreateWorkspaceStatusMutation,
  useDeleteWorkspaceStatusMutation,
  useGetWorkspaceStatusesQuery,
  useUpdateWorkspaceMutation,
  type IWorkspaceStatus,
} from "@/redux/api/workspaceApi";
import {
  useCreateLabelMutation,
  useDeleteLabelMutation,
  useGetLabelsQuery,
  type ILabel,
} from "@/redux/api/labelApi";
import { useWorkspace } from "@/context/WorkspaceContext";
import { extractList } from "@/lib/taskStats";
import { apiErrorMessage, isApiSuccess } from "@/lib/apiError";
import {
  workspaceKindLabel,
  workspaceRoleLabel,
} from "@/lib/workspaceUi";

export default function WorkspaceSettingsPage() {
  const { workspaceId, workspace, isAdmin, canManage, refetchWorkspaces } =
    useWorkspace();
  const [wsName, setWsName] = useState("");
  const [wsDesc, setWsDesc] = useState("");
  const [statusLabel, setStatusLabel] = useState("");
  const [statusKey, setStatusKey] = useState("");
  const [labelName, setLabelName] = useState("");
  const [labelColor, setLabelColor] = useState("#c8f542");

  const { data: statusResult } = useGetWorkspaceStatusesQuery(
    workspaceId || "",
    { skip: !workspaceId },
  );
  const { data: labelResult } = useGetLabelsQuery(workspaceId || "", {
    skip: !workspaceId,
  });

  const [updateWorkspace, { isLoading: savingWs }] =
    useUpdateWorkspaceMutation();
  const [createStatus] = useCreateWorkspaceStatusMutation();
  const [deleteStatus] = useDeleteWorkspaceStatusMutation();
  const [createLabel] = useCreateLabelMutation();
  const [deleteLabel] = useDeleteLabelMutation();

  const statuses = useMemo(() => {
    const list = extractList<IWorkspaceStatus>(
      statusResult?.data ?? statusResult,
    );
    // Copy first — RTK Query arrays are immutable
    return [...list].sort((a, b) => a.order - b.order);
  }, [statusResult]);
  const labels = useMemo(
    () => extractList<ILabel>(labelResult?.data ?? labelResult),
    [labelResult],
  );

  useEffect(() => {
    if (workspace) {
      setWsName(workspace.name);
      setWsDesc(workspace.description || "");
    }
  }, [workspace]);

  const onSaveWorkspace = async (e: FormEvent) => {
    e.preventDefault();
    if (!workspaceId || !isAdmin) return;
    const res = await updateWorkspace({
      id: workspaceId,
      name: wsName.trim(),
      description: wsDesc.trim(),
    });
    if (isApiSuccess(res)) {
      toast.success("Workspace updated");
      refetchWorkspaces();
    } else toast.error(apiErrorMessage(res));
  };

  const onAddStatus = async (e: FormEvent) => {
    e.preventDefault();
    if (!workspaceId || !isAdmin) return;
    const key =
      statusKey.trim() ||
      statusLabel
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    if (!statusLabel.trim() || !key) {
      toast.error("Label and key are required");
      return;
    }
    const res = await createStatus({
      workspaceId,
      key,
      label: statusLabel.trim(),
      order: statuses.length,
    });
    if (isApiSuccess(res)) {
      toast.success("Status added");
      setStatusLabel("");
      setStatusKey("");
    } else toast.error(apiErrorMessage(res));
  };

  const onAddLabel = async (e: FormEvent) => {
    e.preventDefault();
    if (!workspaceId || !canManage) return;
    if (!labelName.trim()) {
      toast.error("Label name required");
      return;
    }
    const res = await createLabel({
      workspaceId,
      name: labelName.trim(),
      color: labelColor,
    });
    if (isApiSuccess(res)) {
      toast.success("Label added");
      setLabelName("");
    } else toast.error(apiErrorMessage(res));
  };

  if (!workspaceId) {
    return (
      <div className="px-4 py-6 text-sm text-muted md:px-8">
        Select a workspace first.
      </div>
    );
  }

  return (
    <div className="dash-enter px-3 py-4 sm:px-4 sm:py-6 md:px-8 md:py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {workspace ? workspaceKindLabel(workspace) : "Workspace"}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink">
          {workspace?.name || "Settings"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Your role:{" "}
          <span className="font-semibold text-ink">
            {workspaceRoleLabel(workspace?.membershipRole)}
          </span>
          {!isAdmin
            ? " · Only the workspace manager can rename it or edit board statuses."
            : " · You can rename this workspace and manage board columns."}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-ink/10 bg-white p-5">
          <h2 className="font-display text-lg font-bold text-ink">Details</h2>
          {isAdmin ? (
            <form onSubmit={onSaveWorkspace} className="mt-4 space-y-3">
              <label className="block text-sm font-medium">
                Name
                <input
                  value={wsName}
                  onChange={(e) => setWsName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-ink/15 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40"
                />
              </label>
              <label className="block text-sm font-medium">
                Description
                <textarea
                  value={wsDesc}
                  onChange={(e) => setWsDesc(e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full rounded-xl border border-ink/15 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40"
                />
              </label>
              <button
                type="submit"
                disabled={savingWs}
                className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-accent disabled:opacity-60"
              >
                {savingWs ? "Saving…" : "Save"}
              </button>
            </form>
          ) : (
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                  Name
                </p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {workspace?.name || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                  Description
                </p>
                <p className="mt-1 text-sm text-ink">
                  {workspace?.description?.trim() || "No description"}
                </p>
              </div>
              <p className="rounded-xl border border-ink/10 bg-mist px-3 py-2 text-xs text-muted">
                View only — the workspace manager can rename this space.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-ink/10 bg-white p-5">
          <h2 className="font-display text-lg font-bold text-ink">
            Board statuses
          </h2>
          <p className="mt-1 text-xs text-muted">
            Admins can add custom columns. Defaults ship with every workspace.
          </p>
          <ul className="mt-4 space-y-2">
            {statuses.map((s) => (
              <li
                key={s._id}
                className="flex items-center justify-between gap-2 rounded-xl border border-ink/10 px-3 py-2"
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: s.color }}
                  />
                  {s.label}
                  <span className="text-xs text-muted">({s.key})</span>
                </span>
                {isAdmin && !s.isDefault ? (
                  <button
                    type="button"
                    className="text-xs font-semibold text-signal"
                    onClick={async () => {
                      if (!window.confirm(`Remove status “${s.label}”?`)) return;
                      const res = await deleteStatus(s._id);
                      if (isApiSuccess(res)) toast.success("Removed");
                      else toast.error(apiErrorMessage(res));
                    }}
                  >
                    Remove
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
          {isAdmin ? (
            <form onSubmit={onAddStatus} className="mt-4 grid gap-2 sm:grid-cols-2">
              <input
                value={statusLabel}
                onChange={(e) => setStatusLabel(e.target.value)}
                placeholder="Label (e.g. Review)"
                className="rounded-xl border border-ink/15 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
              />
              <input
                value={statusKey}
                onChange={(e) => setStatusKey(e.target.value)}
                placeholder="Key (optional)"
                className="rounded-xl border border-ink/15 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
              />
              <button
                type="submit"
                className="rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-accent sm:col-span-2"
              >
                Add status
              </button>
            </form>
          ) : null}
        </section>

        <section className="rounded-2xl border border-ink/10 bg-white p-5 xl:col-span-2">
          <h2 className="font-display text-lg font-bold text-ink">Labels</h2>
          <p className="mt-1 text-xs text-muted">
            Managers and admins can create labels for filtering and tags.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {labels.map((l) => (
              <span
                key={l._id}
                className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-3 py-1 text-sm"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: l.color }}
                />
                {l.name}
                {canManage ? (
                  <button
                    type="button"
                    className="text-xs text-muted hover:text-signal"
                    onClick={async () => {
                      const res = await deleteLabel(l._id);
                      if (isApiSuccess(res)) toast.success("Label removed");
                      else toast.error(apiErrorMessage(res));
                    }}
                  >
                    ×
                  </button>
                ) : null}
              </span>
            ))}
            {!labels.length ? (
              <p className="text-sm text-muted">No labels yet</p>
            ) : null}
          </div>
          {canManage ? (
            <form
              onSubmit={onAddLabel}
              className="mt-4 flex flex-wrap items-end gap-2"
            >
              <label className="text-sm font-medium">
                Name
                <input
                  value={labelName}
                  onChange={(e) => setLabelName(e.target.value)}
                  className="mt-1 block rounded-xl border border-ink/15 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
                />
              </label>
              <label className="text-sm font-medium">
                Color
                <input
                  type="color"
                  value={labelColor}
                  onChange={(e) => setLabelColor(e.target.value)}
                  className="mt-1 block h-10 w-14 cursor-pointer rounded-lg border border-ink/15 bg-white"
                />
              </label>
              <button
                type="submit"
                className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-accent"
              >
                Add label
              </button>
            </form>
          ) : null}
        </section>
      </div>
    </div>
  );
}
