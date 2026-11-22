"use client";

import { statusLabel } from "@/lib/statusStyles";

type FilterProps = {
  tasksFilter: string[];
  status: string;
  setStatus: (status: string) => void;
  handleReset: () => void;
};

export default function Filter({
  tasksFilter,
  status,
  setStatus,
  handleReset,
}: FilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor="status-filter">
        Filter by status
      </label>
      <select
        id="status-filter"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        aria-label="Filter by status"
        className="w-full min-w-0 rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm font-medium text-ink outline-none focus:border-ink/40 focus:ring-2 focus:ring-accent/40 sm:w-auto sm:min-w-[160px]"
      >
        <option value="">All statuses</option>
        {tasksFilter?.length > 0 ? (
          tasksFilter.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))
        ) : (
          <option value="" disabled>
            No statuses
          </option>
        )}
      </select>

      <button
        type="button"
        onClick={handleReset}
        className="rounded-xl border border-ink/15 px-3 py-2.5 text-sm font-semibold text-ink hover:bg-paper"
      >
        Reset
      </button>
    </div>
  );
}
