"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/axios/axiosInstance";
import { getAccessToken } from "@/lib/auth/token";

export default function AcceptInvitePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params.token;
  const [preview, setPreview] = useState<{
    email?: string;
    role?: string;
    workspaceId?: { name?: string } | string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axiosInstance.get(`/invites/token/${token}`);
        if (!cancelled) setPreview(res.data?.data || res.data);
      } catch {
        if (!cancelled) setError("Invite not found or expired");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const accept = async () => {
    const access = getAccessToken();
    if (!access) {
      toast.message("Log in with the invited email, then open this link again");
      router.push(`/login?redirect=/invite/${token}`);
      return;
    }
    try {
      await axiosInstance.post(`/invites/token/${token}/accept`);
      toast.success("Joined workspace");
      router.replace("/dashboard/overview");
    } catch {
      toast.error("Could not accept invite — check you’re logged in as the invited email");
    }
  };

  const workspaceName =
    preview &&
    typeof preview.workspaceId === "object" &&
    preview.workspaceId?.name
      ? preview.workspaceId.name
      : "a workspace";

  return (
    <div className="flex min-h-dvh items-center justify-center bg-mist px-4">
      <div className="w-full max-w-md rounded-2xl border border-ink/10 bg-paper p-8 shadow-[0_20px_50px_rgba(16,20,24,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          Invitation
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink">
          Join workspace
        </h1>
        {loading ? (
          <p className="mt-4 text-sm text-muted">Loading invite…</p>
        ) : error ? (
          <p className="mt-4 text-sm text-signal">{error}</p>
        ) : (
          <>
            <p className="mt-3 text-sm text-muted">
              You’re invited to <span className="font-semibold text-ink">{workspaceName}</span>
              {preview?.role ? ` as ${preview.role}` : ""}.
            </p>
            <p className="mt-1 text-xs text-muted">Sent to {preview?.email}</p>
            <button
              type="button"
              onClick={accept}
              className="mt-6 w-full rounded-xl bg-ink py-3 text-sm font-semibold text-accent"
            >
              Accept invite
            </button>
          </>
        )}
        <Link
          href="/login"
          className="mt-4 block text-center text-sm text-muted hover:text-ink"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
