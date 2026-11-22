"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useCreateWorkspaceMutation } from "@/redux/api/workspaceApi";
import { useWorkspace } from "@/context/WorkspaceContext";

type Props = {
  open: boolean;
  onClose: () => void;
  dark?: boolean;
};

export function CreateWorkspaceModal({ open, onClose }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [createWorkspace, { isLoading }] = useCreateWorkspaceMutation();
  const { setWorkspaceId, refetchWorkspaces } = useWorkspace();

  if (!open) return null;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Name needs at least 2 characters");
      return;
    }
    const res = await createWorkspace({
      name: name.trim(),
      description: description.trim() || undefined,
    });
    const created = res?.data?.data as { _id?: string } | undefined;
    if (res?.data?.success || created?._id) {
      toast.success("Workspace created");
      refetchWorkspaces();
      if (created?._id) setWorkspaceId(created._id);
      setName("");
      setDescription("");
      onClose();
    } else {
      toast.error("Could not create workspace");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-2xl border border-ink/10 bg-paper p-6 shadow-[0_24px_60px_rgba(16,20,24,0.28)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Team workspace
            </p>
            <h2 className="mt-1 font-display text-xl font-bold text-ink">
              Create team space
            </h2>
            <p className="mt-1 text-sm text-muted">
              Invite members and assign work in a shared board.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted hover:bg-mist hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <div>
            <label className="text-sm font-medium text-ink" htmlFor="ws-name">
              Name
            </label>
            <input
              id="ws-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Product team"
              className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40"
              autoFocus
            />
          </div>
          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="ws-description"
            >
              Description
            </label>
            <textarea
              id="ws-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Optional"
              className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-ink/15 px-4 py-2 text-sm font-semibold text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-accent disabled:opacity-60"
            >
              {isLoading ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
