"use client";

import Link from "next/link";
import { ClipboardList, UserRound, ArrowRight } from "lucide-react";
import type { ILandingContent } from "@/redux/api/landingApi";
import Reveal from "@/components/home/Reveal";

const FALLBACK: NonNullable<ILandingContent["roles"]> = {
  eyebrow: "How Planboard works",
  title: "Manager or member. Clear jobs.",
  subtitle:
    "Nobody signs up as an admin. Managers lead teams. Members work solo or join a manager’s workspace when invited.",
  cards: [
    {
      key: "manager",
      eyebrow: "Manager",
      title: "Lead a team workspace",
      summary:
        "Sign up as a manager to create a team board, invite people, and assign work.",
      points: [
        "Create your team workspace on signup",
        "Invite members by email link or temporary login",
        "Assign tasks, bulk-update, and clear overdue work",
        "Message members when something needs a conversation",
      ],
      ctaLabel: "Create manager account",
      ctaHref: "/register?intent=manager",
    },
    {
      key: "member",
      eyebrow: "Member",
      title: "Work solo — or join a team",
      summary:
        "Sign up as a member for a personal board, or accept a manager’s invite to join their workspace.",
      points: [
        "Solo: your own board, no team under you",
        "Invited: join via link or temporary password",
        "Update tasks assigned to you from My work",
        "Comment, upload files, and track due dates",
      ],
      ctaLabel: "See the status path",
      ctaHref: "#pipeline",
    },
  ],
};

const ICONS = {
  manager: ClipboardList,
  member: UserRound,
} as const;

type Props = {
  content?: ILandingContent["roles"] | null;
};

export default function HomeRoles({ content }: Props) {
  const roles = content?.cards?.length ? content : FALLBACK;

  return (
    <section id="roles" className="border-t border-ink/10 bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-5 sm:py-16 md:px-8 md:py-24">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {roles.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl md:text-4xl">
              {roles.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base md:text-lg">
              {roles.subtitle}
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {roles.cards.map((role, i) => {
            const Icon =
              ICONS[role.key as keyof typeof ICONS] ||
              (i === 0 ? ClipboardList : UserRound);
            const href = role.ctaHref || "#";
            const isHash = href.startsWith("#");
            return (
              <Reveal
                key={role.key || role.eyebrow}
                delayClass={`reveal-delay-${Math.min(i + 1, 3)}`}
              >
                <article className="relative flex h-full flex-col overflow-hidden bg-mist px-5 pb-6 pt-5">
                  <div className="absolute inset-y-0 left-0 w-1 bg-accent" />
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-accent">
                    <Icon size={18} />
                  </span>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                    {role.eyebrow}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-bold text-ink">
                    {role.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {role.summary}
                  </p>
                  <ul className="mt-5 flex-1 space-y-2.5 text-sm leading-relaxed text-ink/80">
                    {role.points.map((p) => (
                      <li key={p} className="flex gap-2.5">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-deep" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                  {role.ctaLabel ? (
                    isHash ? (
                      <a
                        href={href}
                        className="mt-5 inline-flex items-center gap-2 self-start rounded-xl border border-ink/20 bg-white px-4 py-2.5 text-sm font-semibold text-ink"
                      >
                        {role.ctaLabel}
                        <ArrowRight size={16} />
                      </a>
                    ) : (
                      <Link
                        href={href}
                        className="mt-5 inline-flex items-center gap-2 self-start rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-accent"
                      >
                        {role.ctaLabel}
                        <ArrowRight size={16} />
                      </Link>
                    )
                  ) : null}
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
