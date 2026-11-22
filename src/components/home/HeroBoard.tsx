import type { ILandingStage } from "@/redux/api/landingApi";

const DEFAULT_COLUMNS = [
  {
    title: "General",
    tint: "bg-[#d7dde8]",
    tasks: ["Intake from standup", "Clarify scope"],
  },
  {
    title: "Backlog",
    tint: "bg-[#c9dff5]",
    tasks: ["Prioritize sprint items"],
  },
  {
    title: "In progress",
    tint: "bg-[#f3e0a8]",
    tasks: ["Ship board filters", "Wire calendar due dates"],
  },
  {
    title: "Paused",
    tint: "bg-[#f5d0b5]",
    tasks: ["Unblock reviewer"],
  },
  {
    title: "Ready to launch",
    tint: "bg-[#c8ecc0]",
    tasks: ["Release notes"],
  },
];

const TINTS = [
  "bg-[#d7dde8]",
  "bg-[#c9dff5]",
  "bg-[#f3e0a8]",
  "bg-[#f5d0b5]",
  "bg-[#c8ecc0]",
];

const SAMPLE_TASKS = [
  ["Intake from standup", "Clarify scope"],
  ["Prioritize sprint items"],
  ["Ship board filters", "Wire calendar due dates"],
  ["Unblock reviewer"],
  ["Release notes"],
];

type Props = {
  stages?: ILandingStage[] | null;
  compact?: boolean;
};

export default function HeroBoard({ stages, compact = false }: Props) {
  const columns =
    stages && stages.length > 0
      ? stages.slice(0, 5).map((stage, i) => ({
          title: stage.name,
          tint: TINTS[i % TINTS.length],
          tasks: (SAMPLE_TASKS[i] || ["Open task"]).slice(
            0,
            compact ? 1 : 1,
          ),
        }))
      : DEFAULT_COLUMNS.map((col) => ({
          ...col,
          tasks: col.tasks.slice(0, compact ? 1 : 1),
        }));

  return (
    <div
      className={`animate-drift relative w-full overflow-hidden bg-ink-soft ${
        compact
          ? "min-h-0 rounded-xl"
          : "min-h-[200px] rounded-xl sm:min-h-[240px] sm:rounded-2xl md:min-h-[280px]"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(200,245,66,0.18),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(255,107,61,0.12),transparent_40%)]" />
      <div
        className={`relative flex h-full gap-2 overflow-x-auto p-3 md:gap-2.5 md:p-4 ${
          compact ? "p-2.5" : ""
        }`}
      >
        {columns.map((col) => (
          <div
            key={col.title}
            className="flex min-w-0 flex-1 flex-col gap-1.5"
            style={{ flexBasis: 0 }}
          >
            <div className="flex items-center justify-between gap-1 px-0.5">
              <p className="truncate text-[9px] font-semibold uppercase tracking-[0.1em] text-white/70 md:text-[10px]">
                {col.title}
              </p>
              <span className={`h-1.5 w-1.5 shrink-0 rounded-sm ${col.tint}`} />
            </div>
            <div className="flex flex-col gap-1.5">
              {col.tasks.map((task) => (
                <div
                  key={task}
                  className="border border-white/10 bg-white/[0.07] px-2 py-2 text-[11px] leading-snug text-white/90 backdrop-blur-sm md:px-2.5 md:py-2.5 md:text-xs"
                >
                  {task}
                </div>
              ))}
              {!compact ? (
                <div className="border border-dashed border-white/15 px-2 py-3 text-[10px] text-white/35">
                  Drop here
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
