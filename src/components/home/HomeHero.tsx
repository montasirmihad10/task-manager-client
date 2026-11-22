"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useGetMyProfileQuery } from "@/redux/api/authApi";
import { getClientToken } from "@/lib/auth/cookies.client";
import type { ILandingContent } from "@/redux/api/landingApi";
import { BRAND } from "@/lib/brand";
import BrandMark from "@/components/brand/BrandMark";
import HeroBoard from "@/components/home/HeroBoard";
import SafeImage from "@/components/home/SafeImage";

type Props = {
  content?: ILandingContent["hero"] | null;
  stages?: ILandingContent["pipeline"]["stages"] | null;
};

export default function HomeHero({ content, stages }: Props) {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(Boolean(getClientToken()));
  }, []);

  const { data: profileResult } = useGetMyProfileQuery(undefined, {
    skip: !hasToken,
  });
  const user = profileResult?.data;

  const brand = content?.brand || BRAND.name;
  const headline =
    content?.headline ||
    "Managers assign. Members deliver. Everyone sees the board.";
  const subhead =
    content?.subhead ||
    "One free workspace with a clear status path, roles, calendar, projects, chat, and an inbox.";
  const primaryCta = content?.primaryCta || "Create free account";
  const secondaryCta = content?.secondaryCta || "See how roles work";
  const banner = content?.bannerImage || "";
  const accent =
    content?.accentImage || "/brand/planboard-hero-illustration.jpg";

  const primaryHref = user ? "/dashboard/overview" : "/register";
  const primaryLabel = user ? "Open your board" : primaryCta;

  return (
    <section className="relative overflow-hidden bg-mist">
      {banner ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[36%] sm:h-[42%] lg:h-[50%]">
          <SafeImage
            src={banner}
            alt=""
            fill
            priority
            className="object-cover object-[center_32%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/35 via-ink/12 to-mist" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-mist via-mist/90 to-transparent sm:h-32" />
        </div>
      ) : (
        <>
          <div className="home-grid pointer-events-none absolute inset-0" />
          <div className="pointer-events-none absolute -left-24 top-16 h-56 w-56 rounded-full bg-accent/25 blur-3xl sm:h-72 sm:w-72" />
          <div className="pointer-events-none absolute right-0 top-24 h-48 w-48 rounded-full bg-signal/10 blur-3xl sm:h-64 sm:w-64" />
        </>
      )}

      <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 pt-4 sm:gap-3 sm:px-5 sm:pt-5 md:px-8">
        <div className="min-w-0 shrink">
          <BrandMark href="/" size={32} className="sm:hidden" />
          <BrandMark href="/" size={36} className="hidden sm:inline-flex" />
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {user ? (
            <Link
              href="/dashboard/overview"
              className="nav-soft-btn nav-soft-btn-solid rounded-xl px-3 py-2 text-xs font-semibold sm:px-3.5"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="nav-soft-btn nav-soft-btn-ghost rounded-xl px-3 py-2 text-xs font-semibold sm:px-3.5"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="nav-soft-btn nav-soft-btn-solid rounded-xl px-3 py-2 text-xs font-semibold sm:px-3.5"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl items-start gap-7 px-4 pb-10 pt-8 sm:gap-8 sm:px-5 sm:pb-12 sm:pt-10 md:gap-8 md:px-8 md:pb-14 md:pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12">
        <div className="min-w-0 max-w-xl lg:max-w-none lg:pr-2">
          <p className="animate-rise font-display text-[clamp(2.1rem,6vw,3.5rem)] font-extrabold leading-[0.95] tracking-tight text-ink [overflow-wrap:anywhere]">
            {brand}
          </p>
          <h1 className="animate-rise-delay-1 mt-3 font-display text-lg font-semibold leading-[1.25] tracking-tight text-ink sm:text-xl md:text-[1.65rem]">
            {headline}
          </h1>
          <p className="animate-rise-delay-2 mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-[0.95rem] md:text-base">
            {subhead}
          </p>

          <div className="animate-rise-delay-3 mt-5 flex w-full flex-col gap-2.5 sm:mt-6 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href={primaryHref}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-accent transition hover:bg-ink-soft sm:w-auto sm:py-2.5"
            >
              {primaryLabel}
              <ArrowRight size={16} />
            </Link>
            <a
              href="#roles"
              className="inline-flex w-full items-center justify-center rounded-xl border border-ink/20 bg-paper/95 px-4 py-3 text-sm font-semibold text-ink backdrop-blur-sm transition hover:bg-paper sm:w-auto sm:py-2.5"
            >
              {secondaryCta}
            </a>
          </div>

          <div className="animate-rise-delay-3 mt-5 flex flex-wrap gap-x-3 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted sm:mt-6 sm:gap-x-4 sm:text-[11px]">
            <span>Board</span>
            <span className="text-ink/25">·</span>
            <span>Roles</span>
            <span className="text-ink/25">·</span>
            <span>Calendar</span>
            <span className="text-ink/25">·</span>
            <span>Chat</span>
          </div>
        </div>

        <div className="relative z-20 min-w-0 w-full animate-board justify-self-stretch">
          {accent ? (
            <div className="relative mb-3 overflow-hidden rounded-xl border border-ink/10 bg-white shadow-[0_12px_32px_rgba(16,20,24,0.1)] sm:rounded-2xl">
              <div className="relative aspect-[16/10] w-full sm:aspect-[2/1]">
                <SafeImage
                  src={accent}
                  alt="Planboard workspace illustration"
                  fill
                  priority
                  className="object-cover object-center"
                  fallbackClassName="absolute inset-0 bg-mist"
                />
              </div>
            </div>
          ) : null}
          <div className="relative w-full max-w-full overflow-hidden rounded-xl border border-ink/10 shadow-[0_24px_60px_rgba(16,20,24,0.18)] sm:rounded-2xl">
            <HeroBoard stages={stages} />
          </div>
        </div>
      </div>
    </section>
  );
}
