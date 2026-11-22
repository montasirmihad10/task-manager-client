"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useGetTaskStatsQuery } from "@/redux/api/taskApi";
import { chartColorFor, statusLabel } from "@/lib/statusStyles";
import { normalizeTaskStats } from "@/lib/taskStats";

export default function Charts({
  workspaceId,
  platformScope = false,
}: {
  workspaceId?: string | null;
  /** When true (platform admin), aggregate every workspace */
  platformScope?: boolean;
}) {
  const { data: statsResult, isLoading } = useGetTaskStatsQuery(
    platformScope
      ? { scope: "platform" }
      : workspaceId
        ? { workspaceId, scope: "workspace" }
        : undefined,
    { skip: !platformScope && !workspaceId },
  );
  const taskStats = normalizeTaskStats(statsResult?.data ?? statsResult);
  const total = taskStats.reduce((sum, s) => sum + s.count, 0);

  const barData = taskStats.map((s) => ({
    name: statusLabel(String(s._id)),
    value: s.count,
    fill: chartColorFor(String(s._id)),
  }));

  const pieData = taskStats
    .filter((s) => s.count > 0)
    .map((s) => ({
      name: statusLabel(String(s._id)),
      value: s.count,
      fill: chartColorFor(String(s._id)),
    }));

  if (isLoading && !statsResult) {
    return (
      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.85fr]">
        <div className="skeleton h-72 rounded-2xl" />
        <div className="skeleton h-72 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.35fr_0.85fr]">
      <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-[0_10px_30px_rgba(16,20,24,0.04)] md:p-5">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              {platformScope ? "Platform pipeline" : "Pipeline"}
            </p>
            <h2 className="font-display text-lg font-semibold text-ink">
              Volume by stage
            </h2>
          </div>
          <p className="text-xs text-muted">
            Total <span className="font-bold text-ink">{total}</span>
          </p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} barCategoryGap="28%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d7ddd2" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#5f6d66", fontSize: 11 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#5f6d66", fontSize: 11 }}
                width={28}
              />
              <Tooltip
                cursor={{ fill: "rgba(16,20,24,0.04)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid rgba(16,20,24,0.1)",
                  background: "#f7f9f5",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 4, 4]} maxBarSize={44}>
                {barData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-[0_10px_30px_rgba(16,20,24,0.04)] md:p-5">
        <div className="mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            Distribution
          </p>
          <h2 className="font-display text-lg font-semibold text-ink">Mix</h2>
        </div>
        <div className="relative mx-auto h-56 w-full max-w-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData.length ? pieData : [{ name: "Empty", value: 1, fill: "#d7ddd2" }]}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={84}
                paddingAngle={pieData.length ? 3 : 0}
                stroke="none"
              >
                {(pieData.length ? pieData : [{ fill: "#d7ddd2" }]).map(
                  (entry, index) => (
                    <Cell key={`${entry.fill}-${index}`} fill={entry.fill} />
                  ),
                )}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid rgba(16,20,24,0.1)",
                  background: "#f7f9f5",
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted">
              Total
            </p>
            <p className="font-display text-2xl font-bold text-ink">{total}</p>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {taskStats.map((s) => (
            <span
              key={s._id}
              className="inline-flex items-center gap-1.5 rounded-full bg-mist px-2.5 py-1 text-[11px] text-ink"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  background: chartColorFor(String(s._id)),
                }}
              />
              {statusLabel(String(s._id))} · {s.count}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
