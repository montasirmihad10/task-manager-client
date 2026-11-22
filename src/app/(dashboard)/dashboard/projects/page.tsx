"use client";

import { FormEvent, useMemo, useState } from "react";
import { FolderKanban, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectsQuery,
  type IProject,
} from "@/redux/api/projectApi";
import { useWorkspace } from "@/context/WorkspaceContext";
import { extractList } from "@/lib/taskStats";
import { apiErrorMessage, isApiSuccess } from "@/lib/apiError";

export default function ProjectsPage() {
  const { workspaceId, workspace, canManage, isAdmin } = useWorkspace();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data, isLoading, isError, refetch } = useGetProjectsQuery(
    workspaceId || "",
    { skip: !workspaceId },
  );
  const [createProject, { isLoading: creating }] = useCreateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const projects = useMemo(
    () => extractList<IProject>(data?.data ?? data),
    [data],
  );

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!workspaceId || !canManage) return;
    if (name.trim().length < 2) {
      toast.error("Name needs at least 2 characters");
      return;
    }
    const res = await createProject({
      workspaceId,
      name: name.trim(),
      description: description.trim() || undefined,
    });
    if (isApiSuccess(res)) {
      toast.success("Project created");
      setName("");
      setDescription("");
    } else {
      toast.error(apiErrorMessage(res, "Could not create project"));
    }
  };

  const onDelete = async (project: IProject) => {
    if (!workspaceId || !isAdmin) return;
    if (!window.confirm(`Delete project “${project.name}”?`)) return;
    const res = await deleteProject({ id: project._id, workspaceId });
    if (isApiSuccess(res)) toast.success("Project deleted");
    else toast.error(apiErrorMessage(res, "Delete failed"));
  };

  return (
    <div className="dash-enter px-3 py-4 sm:px-4 sm:py-6 md:px-8 md:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Organize
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink">
            Projects
          </h1>
          {workspace ? (
            <p className="mt-1 text-sm text-muted">{workspace.name}</p>
          ) : null}
        </div>
      </div>

      {!workspaceId ? (
        <p className="text-sm text-muted">Select a workspace first.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          {canManage ? (
            <form
              onSubmit={onCreate}
              className="h-fit rounded-2xl border border-ink/10 bg-white p-5"
            >
              <h2 className="font-display text-lg font-bold text-ink">
                New project
              </h2>
              <p className="mt-1 text-xs text-muted">
                Managers and admins can create projects.
              </p>
              <label className="mt-4 block text-sm font-medium text-ink">
                Name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-ink/15 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40"
                  placeholder="Launch Pipeline"
                />
              </label>
              <label className="mt-3 block text-sm font-medium text-ink">
                Description
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full rounded-xl border border-ink/15 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40"
                  placeholder="Optional"
                />
              </label>
              <button
                type="submit"
                disabled={creating}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-accent disabled:opacity-60"
              >
                <Plus size={16} />
                {creating ? "Creating…" : "Create project"}
              </button>
            </form>
          ) : (
            <div className="h-fit rounded-2xl border border-ink/10 bg-mist/60 p-5 text-sm text-muted">
              Only managers and admins can create projects. You can still browse
              existing ones.
            </div>
          )}

          <div>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-16 rounded-xl" />
                ))}
              </div>
            ) : isError ? (
              <div className="rounded-xl border border-signal/30 bg-signal/10 px-4 py-3 text-sm">
                Failed to load.{" "}
                <button type="button" onClick={() => refetch()} className="underline">
                  Retry
                </button>
              </div>
            ) : !projects.length ? (
              <div className="rounded-2xl border border-dashed border-ink/15 px-6 py-14 text-center">
                <FolderKanban className="mx-auto text-muted" size={28} />
                <p className="mt-3 font-display text-lg font-semibold text-ink">
                  No projects yet
                </p>
                <p className="mt-1 text-sm text-muted">
                  Group board work into projects for clearer ownership.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {projects.map((p) => (
                  <li
                    key={p._id}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3.5"
                  >
                    <div>
                      <p className="font-semibold text-ink">{p.name}</p>
                      {p.description ? (
                        <p className="mt-0.5 text-sm text-muted">
                          {p.description}
                        </p>
                      ) : null}
                      <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">
                        {p.status}
                      </p>
                    </div>
                    {isAdmin ? (
                      <button
                        type="button"
                        onClick={() => void onDelete(p)}
                        className="rounded-lg p-2 text-muted hover:bg-signal/10 hover:text-signal"
                        aria-label={`Delete ${p.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
