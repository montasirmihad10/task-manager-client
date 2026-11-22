"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
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
import { getClientToken } from "@/lib/auth/cookies.client";

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasToken(Boolean(getClientToken()));
  }, []);

  const { data: countResult } = useGetUnreadCountQuery(undefined, {
    skip: !hasToken,
    pollingInterval: 60_000,
  });
  const { data: listResult, isLoading } = useGetMyNotificationsQuery(
    { limit: 8, sort: "-createdAt" },
    { skip: !hasToken || !open },
  );
  const [markRead] = useMarkNotificationAsReadMutation();
  const [markAll, { isLoading: markingAll }] =
    useMarkAllNotificationsAsReadMutation();

  const unread =
    (countResult?.data as { count?: number } | undefined)?.count ?? 0;
  const items = extractList<INotification>(listResult?.data ?? listResult);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const openItem = async (n: INotification) => {
    if (!n.isRead) {
      await markRead(n._id);
    }
    setOpen(false);
    router.push(notificationHref(n));
  };

  const onMarkAll = async () => {
    const res = await markAll(undefined);
    if (isApiSuccess(res) || !res.error) {
      toast.success("All caught up");
    } else {
      toast.error(apiErrorMessage(res));
    }
  };

  if (!hasToken) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-xl border border-ink/10 bg-white p-2 text-ink transition hover:bg-mist"
        aria-label={
          unread > 0 ? `${unread} unread notifications` : "Notifications"
        }
        aria-expanded={open}
      >
        <Bell size={18} />
        {unread > 0 ? (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-signal px-1 text-[10px] font-bold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute top-full right-0 z-[60] mt-2 w-[min(calc(100vw-1.25rem),360px)] max-w-[calc(100vw-1.25rem)] overflow-hidden rounded-2xl border border-ink/10 bg-paper shadow-[0_20px_50px_rgba(16,20,24,0.2)]">
          <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                Inbox
              </p>
              <p className="font-display text-base font-bold text-ink">
                Notifications
              </p>
            </div>
            {unread > 0 ? (
              <button
                type="button"
                disabled={markingAll}
                onClick={() => void onMarkAll()}
                className="text-xs font-semibold text-accent-deep hover:underline disabled:opacity-50"
              >
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {isLoading ? (
              <div className="space-y-2 p-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-14 rounded-xl" />
                ))}
              </div>
            ) : !items.length ? (
              <p className="px-4 py-10 text-center text-sm text-muted">
                You’re all caught up.
              </p>
            ) : (
              <ul>
                {items.map((n) => (
                  <li key={n._id} className="border-b border-ink/5 last:border-0">
                    <button
                      type="button"
                      onClick={() => void openItem(n)}
                      className={`flex w-full flex-col gap-0.5 px-4 py-3 text-left transition hover:bg-mist/80 ${
                        n.isRead ? "opacity-75" : "bg-accent/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-ink">
                          {n.title}
                        </p>
                        {!n.isRead ? (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-signal" />
                        ) : null}
                      </div>
                      <p className="line-clamp-2 text-xs text-muted">
                        {n.message}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-wide text-muted">
                        {notificationTypeLabel(n.type)}
                        {senderLabel(n) ? ` · ${senderLabel(n)}` : ""}
                        {n.createdAt ? ` · ${relativeTime(n.createdAt)}` : ""}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-ink/10 bg-mist/50 px-4 py-2.5">
            <Link
              href="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-ink hover:underline"
            >
              View all notifications
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
