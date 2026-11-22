"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { ILandingContent, ILandingStage } from "@/redux/api/landingApi";
import UseModal from "@/components/ui/UseModal";
import Reveal from "@/components/home/Reveal";
import SafeImage from "@/components/home/SafeImage";

type Props = {
  content?: ILandingContent["pipeline"] | null;
};

const FALLBACK_STAGES: ILandingStage[] = [
  {
    name: "General",
    detail: "Park raw ideas and intake items before they hit the backlog.",
    moreInfo:
      "General is the intake lane. Capture notes and requests without forcing priority yet. Managers later pull the best items into Backlog.",
  },
  {
    name: "Backlog",
    detail: "Prioritized work waiting to be pulled into active progress.",
    moreInfo:
      "Backlog is the agreed queue — clarified enough to assign an owner, due date, and priority before work starts.",
  },
  {
    name: "In progress",
    detail: "What the team is executing right now — visible on the board.",
    moreInfo:
      "In progress means someone is actively working the task. Keep comments and files here so managers can unblock quickly.",
  },
  {
    name: "Paused",
    detail: "Blocked or deferred work kept in context until it can move again.",
    moreInfo:
      "Paused keeps blocked work visible. Note why it stopped so managers can clear dependencies and members can resume cleanly.",
  },
  {
    name: "Ready to launch",
    detail: "Finished work waiting for final check or release.",
    moreInfo:
      "Ready to launch is done-enough for review or release — a clear finish line separate from work still in motion.",
  },
];

export default function HomeFlow({ content }: Props) {
  const stages = content?.stages?.length ? content.stages : FALLBACK_STAGES;
  const image = content?.image || "";
  const [active, setActive] = useState<ILandingStage | null>(null);

  return (
    <section id="pipeline" className="border-t border-ink/10 bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-5 sm:py-16 md:px-8 md:py-24">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {content?.eyebrow || "Default board flow"}
            </p>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl md:text-4xl">
              {content?.title ||
                "Five stages from first note to launch-ready."}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base md:text-lg">
              {content?.subtitle ||
                "Every new workspace starts with this path. Admins can customize statuses to match the team. Click a stage to learn more."}
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div>
            <ol className="grid gap-3 sm:grid-cols-2">
              {stages.map((stage, index) => (
                <li
                  key={`${stage.name}-${index}`}
                  className={
                    index === stages.length - 1 && stages.length % 2 === 1
                      ? "sm:col-span-2"
                      : undefined
                  }
                >
                  <Reveal delayClass={`reveal-delay-${Math.min(index + 1, 3)}`}>
                    <button
                      type="button"
                      onClick={() => setActive(stage)}
                      className="group flex h-full w-full flex-col border-l-4 border-accent bg-mist px-4 py-4 text-left transition hover:bg-white hover:shadow-[0_14px_40px_rgba(16,20,24,0.08)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink font-display text-sm font-bold text-accent">
                          {index + 1}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted opacity-0 transition group-hover:opacity-100">
                          More
                          <ArrowUpRight size={14} />
                        </span>
                      </div>
                      <h3 className="mt-3 font-display text-lg font-semibold text-ink">
                        {stage.name}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {stage.detail}
                      </p>
                    </button>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>

          <Reveal delayClass="reveal-delay-2">
            <div className="relative min-h-[280px] overflow-hidden rounded-2xl border border-ink/10 bg-ink lg:sticky lg:top-8 lg:min-h-[420px]">
              {image ? (
                <SafeImage
                  src={image}
                  alt=""
                  fill
                  className="object-cover object-center"
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(200,245,66,0.28),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(255,107,61,0.18),transparent_45%)]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  Board path
                </p>
                <p className="mt-2 font-display text-xl font-bold text-paper md:text-2xl">
                  Status stays visible from intake to launch.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <UseModal
        isOpen={Boolean(active)}
        onClose={() => setActive(null)}
        title={active?.name || "Stage"}
        width="max-w-lg"
        footer={
          <button
            type="button"
            onClick={() => setActive(null)}
            className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-accent"
          >
            Got it
          </button>
        }
      >
        {active ? (
          <div className="space-y-4">
            {active.image ? (
              <div className="relative h-40 overflow-hidden rounded-xl border border-ink/10">
                <SafeImage
                  src={active.image}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
            ) : null}
            <p className="text-sm leading-relaxed text-muted">{active.detail}</p>
            <p className="text-sm leading-relaxed text-ink">
              {active.moreInfo ||
                "Admins can rename or reorder this stage in workspace settings so the board matches how your team ships."}
            </p>
          </div>
        ) : null}
      </UseModal>
    </section>
  );
}
