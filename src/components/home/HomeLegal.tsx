"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ILandingContent } from "@/redux/api/landingApi";
import Reveal from "@/components/home/Reveal";
import SafeImage from "@/components/home/SafeImage";

type Props = {
  content?: ILandingContent["legal"] | null;
};

const FALLBACK_DOCS: ILandingContent["legal"]["docs"] = [
  {
    slug: "about",
    title: "About us",
    blurb: "What Planboard is and what the workspace product includes.",
    coverImage: "",
  },
  {
    slug: "privacy",
    title: "Privacy policy",
    blurb: "How account and workspace data is collected and used.",
    coverImage: "",
  },
  {
    slug: "terms",
    title: "Terms & conditions",
    blurb: "Rules for using Planboard workspaces and accounts.",
    coverImage: "",
  },
];

export default function HomeLegal({ content }: Props) {
  const docs = content?.docs?.length ? content.docs : FALLBACK_DOCS;

  return (
    <section id="legal" className="border-t border-ink/10 bg-mist">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-5 sm:py-16 md:px-8 md:py-24">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {content?.eyebrow || "Trust & policies"}
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
              {content?.title || "About, Privacy, and Terms."}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted md:text-lg">
              {content?.subtitle ||
                "Legal pages are managed in the dashboard and served live from the API — About, Privacy, and Terms."}
            </p>
          </div>
        </Reveal>

        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {docs.map((doc, i) => (
            <li key={doc.slug || i}>
              <Reveal delayClass={`reveal-delay-${Math.min(i + 1, 3)}`}>
                <Link
                  href={`/legal/${doc.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white transition duration-300 hover:-translate-y-1 hover:border-ink/25 hover:shadow-[0_18px_40px_rgba(16,20,24,0.1)]"
                >
                  <div className="relative h-36 overflow-hidden bg-ink/5">
                    <SafeImage
                      src={doc.coverImage}
                      alt=""
                      fill
                      className="object-cover transition duration-700 group-hover:scale-105"
                      fallbackClassName="absolute inset-0 bg-ink/10"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <h3 className="font-display text-xl font-semibold text-ink">
                        {doc.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {doc.blurb}
                      </p>
                    </div>
                    <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                      View document
                      <ArrowUpRight
                        size={16}
                        className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
                  </div>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
