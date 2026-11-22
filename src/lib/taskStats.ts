import type { ITaskStat } from "@/redux/api/taskApi";

export const ALL_STATUSES: string[] = [
  "general",
  "backlog",
  "in-progress",
  "paused",
  "ready-to-launch",
];

/** Merge API aggregates with a full zero-filled pipeline. */
export function normalizeTaskStats(raw: unknown): ITaskStat[] {
  const list = Array.isArray(raw)
    ? (raw as ITaskStat[])
    : Array.isArray((raw as { data?: ITaskStat[] })?.data)
      ? ((raw as { data: ITaskStat[] }).data)
      : [];

  const map = new Map(list.map((s) => [String(s._id), Number(s.count) || 0]));

  return ALL_STATUSES.map((status) => ({
    _id: status,
    count: map.get(status) || 0,
  }));
}

/** Pull payload array from RTK/axios wrapped responses. */
export function extractList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const obj = payload as { data?: unknown; result?: unknown };
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.result)) return obj.result as T[];
  }
  return [];
}
