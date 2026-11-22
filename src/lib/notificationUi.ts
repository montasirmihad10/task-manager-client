import type { INotification } from "@/redux/api/notificationApi";

export function notificationHref(n: INotification): string {
  const taskId = n.data?.taskId ? String(n.data.taskId) : "";
  const conversationId = n.data?.conversationId
    ? String(n.data.conversationId)
    : "";
  if (conversationId || n.type === "message") {
    return conversationId
      ? `/dashboard/messages?c=${conversationId}`
      : "/dashboard/messages";
  }
  if (taskId) return `/dashboard/todo-list?task=${taskId}`;
  if (n.type === "workspace_invite") return "/dashboard/members";
  return "/dashboard/notifications";
}

export function notificationTypeLabel(type: string) {
  return type.replace(/_/g, " ");
}

export function relativeTime(iso?: string) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function senderLabel(n: INotification) {
  if (!n.sender || typeof n.sender === "string") return null;
  return n.sender.name || n.sender.email || null;
}
