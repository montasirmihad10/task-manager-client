"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  IWorkspace,
  TWorkspaceRole,
  useGetMyWorkspacesQuery,
} from "@/redux/api/workspaceApi";
import { extractList } from "@/lib/taskStats";
import { getClientToken } from "@/lib/auth/cookies.client";
import { AUTH_CHANGED_EVENT } from "@/lib/auth/token";
import { usePathname } from "next/navigation";

type WorkspaceContextValue = {
  workspaces: IWorkspace[];
  workspaceId: string | null;
  workspace: IWorkspace | null;
  role: TWorkspaceRole | null;
  isLoading: boolean;
  setWorkspaceId: (id: string) => void;
  canManage: boolean;
  canAssign: boolean;
  /** Workspace owner (DB admin) — settings / ownership */
  isAdmin: boolean;
  /** Can invite people to this workspace (manager+ on a team workspace) */
  canInvite: boolean;
  /** Team (non-personal) workspace */
  isTeamWorkspace: boolean;
  refetchWorkspaces: () => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const STORAGE_KEY = "tm.activeWorkspaceId";

const EMPTY: WorkspaceContextValue = {
  workspaces: [],
  workspaceId: null,
  workspace: null,
  role: null,
  isLoading: false,
  setWorkspaceId: () => undefined,
  canManage: false,
  canAssign: false,
  isAdmin: false,
  canInvite: false,
  isTeamWorkspace: false,
  refetchWorkspaces: () => undefined,
};

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const sync = () => setHasToken(Boolean(getClientToken()));
    sync();
    window.addEventListener("focus", sync);
    window.addEventListener(AUTH_CHANGED_EVENT, sync);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener(AUTH_CHANGED_EVENT, sync);
    };
  }, [pathname]);

  const { data, isLoading, refetch } = useGetMyWorkspacesQuery(undefined, {
    skip: !hasToken,
  });
  const workspaces = useMemo(
    () => (hasToken ? extractList<IWorkspace>(data?.data ?? data) : []),
    [data, hasToken],
  );

  const [workspaceId, setWorkspaceIdState] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaces.length) {
      setWorkspaceIdState(null);
      return;
    }

    const pickDefaultId = () => {
      // Prefer team boards (charts / overview are empty on brand-new personal boards)
      const team =
        workspaces.find((w) => !w.isPersonal && /acme/i.test(w.name || "")) ||
        workspaces.find((w) => !w.isPersonal);
      return (team || workspaces[0])._id;
    };

    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem(STORAGE_KEY)
        : null;
    const storedWs = stored
      ? workspaces.find((w) => w._id === stored)
      : undefined;

    if (storedWs) {
      // If a stale personal board is stored but a team board exists, open the team
      const team = workspaces.find((w) => !w.isPersonal);
      if (storedWs.isPersonal && team) {
        setWorkspaceIdState(team._id);
        localStorage.setItem(STORAGE_KEY, team._id);
        return;
      }
      setWorkspaceIdState(storedWs._id);
      return;
    }

    if (!workspaceId || !workspaces.some((w) => w._id === workspaceId)) {
      const next = pickDefaultId();
      setWorkspaceIdState(next);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, next);
      }
    }
  }, [workspaces, workspaceId]);

  const setWorkspaceId = useCallback((id: string) => {
    setWorkspaceIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, id);
    }
  }, []);

  const workspace = useMemo(
    () => workspaces.find((w) => w._id === workspaceId) || null,
    [workspaces, workspaceId],
  );

  const role = (workspace?.membershipRole as TWorkspaceRole | undefined) || null;
  const isAdmin = role === "admin";
  const canAssign = role === "admin" || role === "manager";
  const canManage = canAssign;
  const isTeamWorkspace = Boolean(workspace && !workspace.isPersonal);
  const canInvite = canManage && isTeamWorkspace;

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspaces,
      workspaceId,
      workspace,
      role,
      isLoading: hasToken ? isLoading : false,
      setWorkspaceId,
      canManage,
      canAssign,
      isAdmin,
      canInvite,
      isTeamWorkspace,
      refetchWorkspaces: () => {
        void refetch();
      },
    }),
    [
      workspaces,
      workspaceId,
      workspace,
      role,
      hasToken,
      isLoading,
      setWorkspaceId,
      canManage,
      canAssign,
      isAdmin,
      canInvite,
      isTeamWorkspace,
      refetch,
    ],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  // Safe fallback so public ↔ dashboard navigations never crash mid-unmount
  return ctx ?? EMPTY;
}
