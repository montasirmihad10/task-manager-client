"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import RichEditor from "@/components/ui/RichEditor";
import { apiErrorMessage, isApiSuccess } from "@/lib/apiError";
import { LEGAL_DOCS, type LegalSlug } from "@/lib/legalUrls";
import { useUploadLandingImageMutation } from "@/redux/api/landingApi";
import {
  useGetAboutQuery,
  useGetPrivacyQuery,
  useGetTermsQuery,
  useUpdateAboutMutation,
  useUpdatePrivacyMutation,
  useUpdateTermsMutation,
  type ILegalDocument,
} from "@/redux/api/settingsApi";

type Props = {
  slug: LegalSlug;
};

export default function LegalDocumentEditor({ slug }: Props) {
  const docMeta = LEGAL_DOCS.find((d) => d.slug === slug)!;

  const aboutQuery = useGetAboutQuery(undefined, { skip: slug !== "about" });
  const privacyQuery = useGetPrivacyQuery(undefined, {
    skip: slug !== "privacy",
  });
  const termsQuery = useGetTermsQuery(undefined, { skip: slug !== "terms" });

  const active =
    slug === "about"
      ? aboutQuery
      : slug === "privacy"
        ? privacyQuery
        : termsQuery;

  const [updateAbout, aboutState] = useUpdateAboutMutation();
  const [updatePrivacy, privacyState] = useUpdatePrivacyMutation();
  const [updateTerms, termsState] = useUpdateTermsMutation();
  const [uploadImage] = useUploadLandingImageMutation();

  const saving =
    aboutState.isLoading || privacyState.isLoading || termsState.isLoading;

  const [html, setHtml] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const payload = active.data?.data as ILegalDocument | null | undefined;
    if (active.isSuccess) {
      setHtml(payload?.description || "");
      setReady(true);
    }
  }, [active.data, active.isSuccess]);

  const onUploadImage = async (file: File) => {
    const res = await uploadImage(file);
    if (isApiSuccess(res)) {
      const url = (res.data?.data as { url?: string } | undefined)?.url;
      if (url) {
        toast.success("Image uploaded");
        return url;
      }
    }
    toast.error(apiErrorMessage(res, "Image upload failed"));
    return null;
  };

  const onSave = async () => {
    const description = html?.trim();
    if (!description) {
      toast.error("Document content can’t be empty");
      return;
    }

    const res =
      slug === "about"
        ? await updateAbout({ description })
        : slug === "privacy"
          ? await updatePrivacy({ description })
          : await updateTerms({ description });

    if (isApiSuccess(res)) toast.success(`${docMeta.title} saved`);
    else toast.error(apiErrorMessage(res));
  };

  if (active.isLoading || !ready) {
    return (
      <div className="space-y-3 px-4 py-6 md:px-6">
        <div className="skeleton h-10 w-64 rounded-xl" />
        <div className="skeleton h-[420px] w-full rounded-2xl" />
      </div>
    );
  }

  if (active.isError) {
    return (
      <div className="px-4 py-8 md:px-6">
        <p className="text-sm font-semibold text-ink">
          Couldn’t load {docMeta.title}
        </p>
        <p className="mt-2 text-sm text-muted">
          {apiErrorMessage(
            { error: active.error },
            "Request failed — check the API is running.",
          )}
        </p>
        <Link
          href="/dashboard/admin/legal"
          className="mt-4 inline-flex text-sm font-semibold underline"
        >
          Back to legal docs
        </Link>
      </div>
    );
  }

  return (
    <div className="dash-enter flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-ink/10 bg-mist px-4 py-4 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <Link
              href="/dashboard/admin/legal"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted hover:text-ink"
            >
              <ArrowLeft size={14} />
              Legal documents
            </Link>
            <h1 className="mt-1 font-display text-2xl font-bold text-ink md:text-3xl">
              Edit {docMeta.title}
            </h1>
            <p className="mt-1 text-sm text-muted">
              Rich HTML editor — saved content is sanitized by the API.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/legal/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-paper"
            >
              Preview
              <ExternalLink size={14} />
            </Link>
            <button
              type="button"
              disabled={saving}
              onClick={() => void onSave()}
              className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-accent disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save document"}
            </button>
          </div>
        </div>
      </div>

      {/* Own scroll pane so the editor toolbar can stick while content moves */}
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 md:px-6 md:py-6">
        <div className="mx-auto w-full max-w-5xl pb-16">
          <RichEditor
            value={html}
            onChange={setHtml}
            minHeight={480}
            toolbarTopOffset={0}
            placeholder={`Write ${docMeta.title.toLowerCase()} content…`}
            onUploadImage={onUploadImage}
          />
        </div>
      </div>
    </div>
  );
}
