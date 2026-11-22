"use client";

import { useState } from "react";
import { ArrowUpRight, CalendarDays, Layers3, ShieldCheck, Users2 } from "lucide-react";
import type { ILandingContent, ILandingPillar } from "@/redux/api/landingApi";
import UseModal from "@/components/ui/UseModal";
import Reveal from "@/components/home/Reveal";
import SafeImage from "@/components/home/SafeImage";

const ICONS: Record<string, typeof Layers3> = {
  boards: Layers3,
  roles: Users2,
  calendar: CalendarDays,
  free: ShieldCheck,
};

type Props = {
  content?: ILandingContent["product"] | null;
};

export default function HomeProduct({ content }: Props) {
  const items = content?.items?.length
    ? content.items
    : [
        {
          title: "Kanban board with your statuses",
          body: "Drag tasks through the workspace pipeline — customize columns in settings.",
          moreInfo:
            "Every workspace starts with a clear board. Customize columns so they match how your team ships.",
          image: "",
          iconKey: "boards",
        },
      ];
  const [active, setActive] = useState<ILandingPillar | null>(null);

  return (
    <section className="relative overflow-hidden border-t border-ink/10 bg-mist">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_80%_30%,rgba(200,245,66,0.22),transparent_55%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-5 sm:py-16 md:px-8 md:py-24">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {content?.eyebrow || "What you get"}
            </p>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl md:text-4xl">
              {content?.title ||
                "Everything your team needs on one board."}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base md:text-lg">
              {content?.subtitle ||
                "Board, projects, calendar, and inbox stay connected — free to use."}
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {items.map((item, i) => {
            const Icon = ICONS[item.iconKey || "boards"] || Layers3;
            return (
              <Reveal
                key={`${item.title}-${i}`}
                delayClass={`reveal-delay-${(i % 3) + 1}`}
              >
                <button
                  type="button"
                  onClick={() => setActive(item)}
                  className="group w-full overflow-hidden rounded-2xl border border-ink/10 bg-white text-left shadow-[0_10px_40px_rgba(16,20,24,0.04)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(16,20,24,0.1)]"
                >
                  <div className="relative h-44 overflow-hidden md:h-52">
                    <SafeImage
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-105"
                      fallbackClassName="absolute inset-0 bg-ink/10"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent" />
                    <span className="absolute bottom-3 left-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-ink">
                      <Icon size={18} />
                    </span>
                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-lg bg-paper/95 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink opacity-0 transition group-hover:opacity-100">
                      More
                      <ArrowUpRight size={12} />
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-xl font-semibold text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted md:text-base">
                      {item.body}
                    </p>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>

      <UseModal
        isOpen={Boolean(active)}
        onClose={() => setActive(null)}
        title={active?.title || ""}
        width="max-w-lg"
      >
        {active ? (
          <div className="space-y-4">
            {active.image ? (
              <div className="relative h-44 overflow-hidden rounded-xl">
                <SafeImage
                  src={active.image}
                  alt=""
                  fill
                  className="object-cover"
                  fallbackClassName="absolute inset-0 bg-mist"
                />
              </div>
            ) : null}
            <p className="text-sm leading-relaxed text-muted">{active.body}</p>
            <p className="text-sm leading-relaxed text-ink">
              {active.moreInfo || active.body}
            </p>
          </div>
        ) : null}
      </UseModal>
    </section>
  );
}
