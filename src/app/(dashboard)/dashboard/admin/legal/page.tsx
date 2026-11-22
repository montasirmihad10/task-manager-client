"use client";

import Link from "next/link";
import { ArrowUpRight, FileText, Scale, Shield } from "lucide-react";
import { useGetMyProfileQuery } from "@/redux/api/authApi";
import { LEGAL_DOCS, type LegalSlug } from "@/lib/legalUrls";

const ICONS: Record<LegalSlug, typeof FileText> = {
  about: FileText,
  privacy: Shield,
  terms: Scale,
};

export default function AdminLegalIndexPage() {
  const { data: profile } = useGetMyProfileQuery(undefined);
  const role = (profile?.data as { role?: string } | undefined)?.role;
  const canEdit = role === "admin" || role === "super_admin";

  if (!canEdit) {
    return (
      <div className="px-4 py-8 text-sm text-muted md:px-6">
        Platform admin access required to edit legal documents.
      </div>
    );
  }

  return (
    <div className="dash-enter px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Platform admin
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink">
            Legal documents
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Edit About, Privacy, and Terms with the rich HTML editor. Content is
            saved to the API and sanitized on the server before publish.
          </p>
        </div>
        <Link
          href="/dashboard/admin/landing"
          className="text-sm font-semibold text-ink underline-offset-2 hover:underline"
        >
          Landing CMS
        </Link>
      </div>

      <ul className="grid w-full gap-4 md:grid-cols-3">
        {LEGAL_DOCS.map((doc) => {
          const Icon = ICONS[doc.slug];
          return (
            <li key={doc.slug}>
              <Link
                href={`/dashboard/admin/legal/${doc.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-ink/10 bg-white p-5 transition hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-[0_16px_40px_rgba(16,20,24,0.08)]"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-accent">
                  <Icon size={18} />
                </span>
                <h2 className="mt-4 font-display text-xl font-bold text-ink">
                  {doc.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {doc.blurb}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink">
                  Open editor
                  <ArrowUpRight
                    size={16}
                    className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
