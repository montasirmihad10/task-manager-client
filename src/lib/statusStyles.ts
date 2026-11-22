import type { TTaskStatus } from "@/redux/api/taskApi";

export const STATUS_TINT: Record<string, string> = {
  general: "bg-[#8b95a1] text-white",
  backlog: "bg-[#3d8fd1] text-white",
  "in-progress": "bg-[#e0a800] text-ink",
  paused: "bg-signal text-white",
  "ready-to-launch": "bg-accent-deep text-white",
};

export const STATUS_DOT: Record<string, string> = {
  general: "bg-[#8b95a1]",
  backlog: "bg-[#3d8fd1]",
  "in-progress": "bg-[#e0a800]",
  paused: "bg-signal",
  "ready-to-launch": "bg-accent-deep",
};

export const STATUS_COLUMN_ACCENT: Record<string, string> = {
  general: "from-[#8b95a1]/25 via-transparent to-transparent",
  backlog: "from-[#3d8fd1]/25 via-transparent to-transparent",
  "in-progress": "from-[#e0a800]/25 via-transparent to-transparent",
  paused: "from-[var(--signal)]/25 via-transparent to-transparent",
  "ready-to-launch": "from-[var(--accent-deep)]/30 via-transparent to-transparent",
};

export const STATUS_CHART_COLORS: Record<string, string> = {
  general: "#8b95a1",
  backlog: "#3d8fd1",
  "in-progress": "#e0a800",
  paused: "#ff6b3d",
  "ready-to-launch": "#9bc41a",
};

export const STATUS_STAT_BG: Record<string, string> = {
  general: "bg-[#8b95a1]",
  backlog: "bg-[#3d8fd1]",
  "in-progress": "bg-[#e0a800]",
  paused: "bg-signal",
  "ready-to-launch": "bg-accent-deep",
};

export function statusLabel(status: string) {
  return status.replace(/-/g, " ");
}

export function tintFor(status: TTaskStatus) {
  return STATUS_TINT[status] || "bg-ink/70 text-white";
}

export function dotFor(status: TTaskStatus) {
  return STATUS_DOT[status] || "bg-ink/40";
}

export function columnAccentFor(status: TTaskStatus) {
  return (
    STATUS_COLUMN_ACCENT[status] ||
    "from-ink/15 via-transparent to-transparent"
  );
}

export function chartColorFor(status: TTaskStatus, fallback?: string) {
  return STATUS_CHART_COLORS[status] || fallback || "#8b95a1";
}
