"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import LegalDocumentEditor from "@/components/admin/LegalDocumentEditor";
import { useGetMyProfileQuery } from "@/redux/api/authApi";
import { isLegalSlug } from "@/lib/legalUrls";

type Props = {
  params: Promise<{ slug: string }>;
};

export default function AdminLegalEditPage({ params }: Props) {
  const { slug } = use(params);
  const { data: profile, isLoading } = useGetMyProfileQuery(undefined);
  const role = (profile?.data as { role?: string } | undefined)?.role;
  const canEdit = role === "admin" || role === "super_admin";

  if (!isLegalSlug(slug)) notFound();

  if (isLoading) {
    return (
      <div className="space-y-3 px-4 py-6 md:px-6">
        <div className="skeleton h-10 w-64 rounded-xl" />
        <div className="skeleton h-[420px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="px-4 py-8 text-sm text-muted md:px-6">
        Platform admin access required to edit legal documents.
      </div>
    );
  }

  return <LegalDocumentEditor slug={slug} />;
}
