"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  Check,
  ChevronDown,
  Plus,
  UserRound,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useGetMyProfileQuery } from "@/redux/api/authApi";
import type { IWorkspace } from "@/redux/api/workspaceApi";
import {
  workspaceContextLine,
  workspaceInitials,
  workspaceKindLabel,
  workspaceRoleHint,
  workspaceRoleLabel,
} from "@/lib/workspaceUi";
import { CreateWorkspaceModal } from "./CreateWorkspaceModal";

function WorkspaceAvatar({
  name,
  isPersonal,
  dark,
  size = "md",
}: {
  name: string;
  isPersonal?: boolean;
  dark?: boolean;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-8 w-8 text-[11px]" : "h-9 w-9 text-xs";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg font-semibold tracking-wide ${dim} ${
        dark
          ? isPersonal
            ? "bg-white/10 text-white/85"
            : "bg-accent/20 text-accent"
          : isPersonal
            ? "bg-mist text-ink"
            : "bg-ink text-accent"
      }`}
      aria-hidden
    >
      {workspaceInitials(name)}
    </span>
  );
}

function WorkspaceOption({
  ws,
  active,
  dark,
  onSelect,
}: {
  ws: IWorkspace;
  active: boolean;
  dark: boolean;
  onSelect: () => void;
}) {
  const role = workspaceRoleLabel(ws.membershipRole);
  const kind = workspaceKindLabel(ws);
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={onSelect}
      className={`flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left transition ${
        active
          ? dark
            ? "bg-white/10"
            : "bg-mist"
          : dark
            ? "hover:bg-white/5"
            : "hover:bg-mist/80"
      }`}
    >
      <WorkspaceAvatar
        name={ws.name}
        isPersonal={ws.isPersonal}
        dark={dark}
        size="sm"
      />
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-sm font-semibold leading-tight ${
            dark ? "text-paper" : "text-ink"
          }`}
        >
          {ws.name}
        </span>
        <span
          className={`mt-0.5 flex items-center gap-1.5 text-[11px] ${
            dark ? "text-white/45" : "text-muted"
          }`}
        >
          {ws.isPersonal ? (
            <UserRound size={11} className="shrink-0 opacity-70" />
          ) : (
            <Building2 size={11} className="shrink-0 opacity-70" />
          )}
          <span>
            {kind} · {role}
          </span>
        </span>
      </span>
      {active ? (
        <Check
          size={16}
          className={`mt-1 shrink-0 ${dark ? "text-accent" : "text-ink"}`}
        />
      ) : null}
    </button>
  );
}

export function WorkspaceSwitcher({ dark = true }: { dark?: boolean }) {
  const { workspaces, workspaceId, workspace, setWorkspaceId, role, isLoading } =
    useWorkspace();
  const { data: profile } = useGetMyProfileQuery(undefined);
  const user = profile?.data as
    | { canManageTeam?: boolean; signupIntent?: string; role?: string }
    | undefined;
  const canCreateTeam =
    user?.canManageTeam ||
    user?.signupIntent === "manager" ||
    user?.role === "admin" ||
    user?.role === "super_admin";
  const [createOpen, setCreateOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const { team, personal } = useMemo(() => {
    const teamList: IWorkspace[] = [];
    const personalList: IWorkspace[] = [];
    for (const ws of workspaces) {
      if (ws.isPersonal) personalList.push(ws);
      else teamList.push(ws);
    }
    return { team: teamList, personal: personalList };
  }, [workspaces]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (isLoading && !workspaces.length) {
    return (
      <div
        className={`h-14 w-full animate-pulse rounded-xl ${
          dark ? "bg-white/10" : "bg-ink/10"
        }`}
      />
    );
  }

  return (
    <div ref={rootRef} className="relative space-y-2">
      {workspaces.length ? (
        <>
          <p
            className={`px-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
              dark ? "text-white/40" : "text-muted"
            }`}
          >
            Workspace
          </p>
          <button
            type="button"
            id="workspace-switcher"
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className={`flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left outline-none transition ${
              dark
                ? "border-white/15 bg-white/5 text-paper hover:bg-white/10"
                : "border-ink/15 bg-white text-ink hover:border-ink/30"
            }`}
          >
            {workspace ? (
              <WorkspaceAvatar
                name={workspace.name}
                isPersonal={workspace.isPersonal}
                dark={dark}
              />
            ) : (
              <span
                className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  dark ? "bg-white/10" : "bg-mist"
                }`}
              >
                <Building2 size={16} />
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold leading-tight">
                {workspace?.name || "Select workspace"}
              </span>
              <span
                className={`mt-0.5 block truncate text-[11px] ${
                  dark ? "text-white/45" : "text-muted"
                }`}
              >
                {workspaceContextLine(workspace, role)}
              </span>
            </span>
            <ChevronDown
              size={16}
              className={`shrink-0 transition ${open ? "rotate-180" : ""} ${
                dark ? "text-white/50" : "text-muted"
              }`}
            />
          </button>

          {workspace ? (
            <p
              className={`px-0.5 text-[11px] leading-snug ${
                dark ? "text-white/40" : "text-muted"
              }`}
            >
              {workspaceRoleHint(role, workspace.isPersonal)}
            </p>
          ) : null}

          {open ? (
            <div
              role="listbox"
              aria-labelledby="workspace-switcher"
              className={`absolute left-0 right-0 z-[70] mt-1 max-h-[min(18rem,50dvh)] overflow-y-auto overscroll-contain rounded-2xl border p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.35)] ${
                dark
                  ? "border-white/15 bg-ink-soft"
                  : "border-ink/10 bg-paper shadow-[0_18px_40px_rgba(16,20,24,0.16)]"
              }`}
            >
              {team.length ? (
                <div className="mb-1">
                  <p
                    className={`px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                      dark ? "text-white/35" : "text-muted"
                    }`}
                  >
                    Team
                  </p>
                  {team.map((ws) => (
                    <WorkspaceOption
                      key={ws._id}
                      ws={ws}
                      active={ws._id === workspaceId}
                      dark={dark}
                      onSelect={() => {
                        setWorkspaceId(ws._id);
                        setOpen(false);
                      }}
                    />
                  ))}
                </div>
              ) : null}

              {personal.length ? (
                <div>
                  <p
                    className={`px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                      dark ? "text-white/35" : "text-muted"
                    }`}
                  >
                    Personal
                  </p>
                  {personal.map((ws) => (
                    <WorkspaceOption
                      key={ws._id}
                      ws={ws}
                      active={ws._id === workspaceId}
                      dark={dark}
                      onSelect={() => {
                        setWorkspaceId(ws._id);
                        setOpen(false);
                      }}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      ) : (
        <p className={`text-xs ${dark ? "text-white/50" : "text-muted"}`}>
          No workspace yet
        </p>
      )}

      {canCreateTeam ? (
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className={`flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed px-2 py-2 text-xs font-semibold transition ${
            dark
              ? "border-white/20 text-white/75 hover:bg-white/5 hover:text-white"
              : "border-ink/20 text-ink hover:bg-mist"
          }`}
        >
          <Plus size={14} />
          New team workspace
        </button>
      ) : null}

      <CreateWorkspaceModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        dark={dark}
      />
    </div>
  );
}
