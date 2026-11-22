import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  fetchLegalHtml,
  isLegalSlug,
  LEGAL_DOCS,
  legalApiBase,
  type LegalSlug,
} from "@/lib/legalUrls";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return LEGAL_DOCS.map((d) => ({ slug: d.slug }));
}

async function resolveDocTitle(slug: LegalSlug) {
  try {
    const res = await fetch(`${legalApiBase()}/settings/landing`, {
      cache: "no-store",
    });
    if (res.ok) {
      const json = (await res.json()) as {
        data?: {
          legal?: { docs?: Array<{ slug: string; title: string }> };
        };
      };
      const fromCms = json?.data?.legal?.docs?.find((d) => d.slug === slug);
      if (fromCms?.title) return fromCms.title;
    }
  } catch {
    /* fall through */
  }
  return LEGAL_DOCS.find((d) => d.slug === slug)?.title || slug;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  if (!isLegalSlug(slug)) {
    return { title: "Legal · Planboard" };
  }
  const title = await resolveDocTitle(slug);
  return { title: `${title} · Planboard` };
}

export default async function LegalDocumentPage({ params }: Props) {
  const { slug } = await params;
  if (!isLegalSlug(slug)) notFound();

  const typed = slug as LegalSlug;
  const title = await resolveDocTitle(typed);

  let html = "";
  let error: string | null = null;
  try {
    html = await fetchLegalHtml(typed);
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load document";
  }

  return (
    <div className="min-h-dvh bg-[linear-gradient(180deg,#e8e4dc_0%,#f7f9f5_45%,#ebe7df_100%)]">
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-semibold text-ink hover:bg-mist"
          >
            <ArrowLeft size={16} />
            Home
          </Link>
          <div className="min-w-0 text-right">
            <p className="truncate font-display text-sm font-bold text-ink">
              {title}
            </p>
            <p className="text-[11px] uppercase tracking-wide text-muted">
              Live from API
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
        {error ? (
          <div className="rounded-2xl border border-signal/30 bg-signal/10 px-5 py-6 text-sm text-ink">
            <p className="font-semibold">Couldn’t load this document</p>
            <p className="mt-2 text-muted">{error}</p>
            <p className="mt-3 text-muted">
              Make sure the API is running and legal content is available — or
              edit it in{" "}
              <Link
                href={`/dashboard/admin/legal/${typed}`}
                className="font-semibold underline"
              >
                Legal docs
              </Link>
              .
            </p>
          </div>
        ) : (
          <article className="legal-prose overflow-hidden rounded-2xl border border-ink/10 bg-paper p-4 shadow-[0_18px_50px_rgba(16,20,24,0.08)] sm:p-6 md:p-10">
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </article>
        )}
      </main>
    </div>
  );
}
