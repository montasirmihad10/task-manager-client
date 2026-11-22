import { envConfig } from "@/config/envConfig";

export type LegalSlug = "about" | "privacy" | "terms";

export const LEGAL_DOCS: Array<{
  slug: LegalSlug;
  title: string;
  blurb: string;
  jsonPath: string;
  htmlPath: string;
  cover: string;
}> = [
  {
    slug: "about",
    title: "About us",
    blurb: "Why Planboard exists and what the product includes.",
    jsonPath: "/settings/about",
    htmlPath: "/settings/about/html",
    cover:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "privacy",
    title: "Privacy policy",
    blurb: "How workspace and account data is handled.",
    jsonPath: "/settings/privacy",
    htmlPath: "/settings/privacy/html",
    cover:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "terms",
    title: "Terms & conditions",
    blurb: "The rules for using the product.",
    jsonPath: "/settings/terms",
    htmlPath: "/settings/terms/html",
    cover:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
  },
];

export function legalApiBase() {
  return (envConfig.baseApi || "").replace(/\/$/, "");
}

export function legalJsonUrl(slug: LegalSlug) {
  const doc = LEGAL_DOCS.find((d) => d.slug === slug);
  return `${legalApiBase()}${doc?.jsonPath || `/settings/${slug}`}`;
}

export function legalHtmlUrl(slug: LegalSlug) {
  const doc = LEGAL_DOCS.find((d) => d.slug === slug);
  return `${legalApiBase()}${doc?.htmlPath || `/settings/${slug}/html`}`;
}

export function isLegalSlug(value: string): value is LegalSlug {
  return LEGAL_DOCS.some((d) => d.slug === value);
}

export async function fetchLegalHtml(slug: LegalSlug): Promise<string> {
  const url = legalJsonUrl(slug);
  // Always hit the API so dashboard editor saves show up immediately
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load legal content (${res.status})`);
  }
  const json = (await res.json()) as {
    data?: { description?: string } | null;
  };
  const html = json?.data?.description;
  if (!html) throw new Error("Legal content is empty");
  return html;
}
