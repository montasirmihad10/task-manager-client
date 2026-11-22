import type { IWorkspace, TWorkspaceRole } from "@/redux/api/workspaceApi";

/** UI label for DB role (admin = workspace owner / manager). */
export function workspaceRoleLabel(role: string | null | undefined): string {
  if (!role) return "Member";
  if (role === "admin") return "Manager";
  if (role === "manager") return "Manager";
  if (role === "member") return "Member";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function workspaceKindLabel(ws: Pick<IWorkspace, "isPersonal"> | null | undefined): string {
  return ws?.isPersonal ? "Personal" : "Team";
}

export function workspaceInitials(name: string | undefined): string {
  const parts = (name || "W").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "W";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function workspaceRoleHint(
  role: TWorkspaceRole | string | null | undefined,
  isPersonal: boolean | undefined,
): string {
  if (isPersonal) {
    return "Solo space — only you";
  }
  if (role === "admin" || role === "manager") {
    return "You can assign work and invite people";
  }
  return "You see work assigned to you";
}

export function workspaceContextLine(
  ws: IWorkspace | null | undefined,
  role: string | null | undefined,
): string {
  if (!ws) return "No workspace selected";
  const kind = workspaceKindLabel(ws);
  const r = workspaceRoleLabel(role);
  return `${kind} · Your role: ${r}`;
}
