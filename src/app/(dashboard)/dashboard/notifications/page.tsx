"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import {
  useGetMyNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
  type INotification,
} from "@/redux/api/notificationApi";
import { extractList } from "@/lib/taskStats";
import {
  notificationHref,
  notificationTypeLabel,
  relativeTime,
  senderLabel,
} from "@/lib/notificationUi";
import { apiErrorMessage, isApiSuccess } from "@/lib/apiError";

type Filter = "all" | "unread";

export default function NotificationsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);

  const { data: countResult } = useGetUnreadCountQuery(undefined);
  const unread =
    (countResult?.data as { count?: number } | undefined)?.count ?? 0;

  const { data, isLoading, isError, refetch, isFetching } =
    useGetMyNotificationsQuery({
      page,
      limit: 20,
      sort: "-createdAt",
      ...(filter === "unread" ? { isRead: false } : {}),
    });

  const [markRead] = useMarkNotificationAsReadMutation();
  const [markAll, { isLoading: markingAll }] =
    useMarkAllNotificationsAsReadMutation();

  const items = useMemo(
    () => extractList<INotification>(data?.data ?? data),
    [data],
  );

  const meta = (data as { meta?: { totalPage?: number; total?: number } })
    ?.meta;
  const totalPages = Math.max(1, meta?.totalPage || 1);

  const openItem = async (n: INotification) => {
    if (!n.isRead) await markRead(n._id);
    router.push(notificationHref(n));
  };

  const onMarkAll = async () => {
    const res = await markAll(undefined);
    if (isApiSuccess(res) || !("error" in res && res.error)) {
      toast.success("All notifications marked as read");
    } else {
      toast.error(apiErrorMessage(res));
    }
  };

  return (
    <div className="dash-enter px-3 py-4 sm:px-4 sm:py-6 md:px-8 md:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Inbox
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-muted">
            {unread > 0
              ? `${unread} unread`
              : "You’re up to date"}
            {isFetching && !isLoading ? " · syncing" : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-ink/15 bg-white p-0.5">
            {(["all", "unread"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setFilter(f);
                  setPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${
                  filter === f
                    ? "bg-ink text-accent"
                    : "text-muted hover:text-ink"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={markingAll || unread === 0}
            onClick={() => void onMarkAll()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-ink/15 bg-white px-3 py-2 text-xs font-semibold text-ink hover:bg-mist disabled:opacity-50"
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-signal/30 bg-signal/10 px-4 py-3 text-sm">
          Couldn’t load notifications.{" "}
          <button type="button" onClick={() => refetch()} className="underline">
            Retry
          </button>
        </div>
      ) : !items.length ? (
        <div className="rounded-2xl border border-dashed border-ink/15 px-6 py-16 text-center">
          <Bell className="mx-auto text-muted" size={28} />
          <p className="mt-3 font-display text-lg font-semibold text-ink">
            {filter === "unread" ? "No unread items" : "No notifications yet"}
          </p>
          <p className="mt-1 text-sm text-muted">
            Assignments, mentions, invites, and reminders show up here.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li key={n._id}>
              <button
                type="button"
                onClick={() => void openItem(n)}
                className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition hover:border-ink/25 ${
                  n.isRead
                    ? "border-ink/10 bg-white"
                    : "border-accent-deep/30 bg-accent/15"
                }`}
              >
                <span
                  className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                    n.isRead ? "bg-ink/20" : "bg-signal"
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-semibold text-ink">{n.title}</span>
                    <span className="text-[11px] text-muted">
                      {relativeTime(n.createdAt)}
                    </span>
                  </span>
                  <span className="mt-1 block text-sm text-ink/80">
                    {n.message}
                  </span>
                  <span className="mt-2 block text-[10px] font-semibold uppercase tracking-wide text-muted">
                    {notificationTypeLabel(n.type)}
                    {senderLabel(n) ? ` · ${senderLabel(n)}` : ""}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-xl border border-ink/15 px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-muted">
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-xl border border-ink/15 px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
