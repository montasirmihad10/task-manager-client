"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ILandingContent } from "@/redux/api/landingApi";
import Reveal from "@/components/home/Reveal";
import SafeImage from "@/components/home/SafeImage";

type Props = {
  content?: ILandingContent["close"] | null;
  brand?: string | null;
};

export default function HomeClose({ content, brand }: Props) {
  const bg = content?.backgroundImage || "";
  const brandName = brand || "Planboard";

  return (
    <section className="relative overflow-hidden bg-ink text-paper">
      {bg ? (
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <SafeImage
            src={bg}
            alt=""
            fill
            className="animate-kenburns object-cover"
          />
          <div className="absolute inset-0 bg-ink/80" />
        </div>
      ) : null}
      <div className="pointer-events-none absolute -right-10 top-0 h-64 w-64 rounded-full bg-accent/25 blur-3xl" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-12 sm:gap-8 sm:px-5 sm:py-16 md:flex-row md:items-end md:px-8 md:py-24">
        <Reveal>
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              {content?.eyebrow || "No paid wall for the core"}
            </p>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-5xl">
              {content?.title || "Open a workspace and start the board."}
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70 sm:text-base md:text-lg">
              {content?.subtitle ||
                "Register, create or join a workspace, invite people, and put your first task on the board."}
            </p>
          </div>
        </Reveal>
        <Reveal delayClass="reveal-delay-2">
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <Link
              href="/register"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition hover:bg-accent-deep hover:text-white sm:w-auto"
            >
              {content?.primaryCta || "Create account"}
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold text-paper transition hover:bg-white/10 sm:w-auto"
            >
              {content?.secondaryCta || "Log in"}
            </Link>
          </div>
        </Reveal>
      </div>

      <div className="relative border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-sm text-white/45 sm:px-5 md:flex-row md:items-center md:justify-between md:px-8">
          <p className="font-display font-semibold text-white/80">{brandName}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href="/legal/about" className="hover:text-accent">
              About
            </Link>
            <Link href="/legal/privacy" className="hover:text-accent">
              Privacy
            </Link>
            <Link href="/legal/terms" className="hover:text-accent">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
