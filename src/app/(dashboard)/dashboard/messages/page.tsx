"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Megaphone,
  MessageSquare,
  Paperclip,
  Send,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useSocketContext } from "@/components/providers/SocketProvider";
import { useGetMyProfileQuery } from "@/redux/api/authApi";
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendChatAttachmentMutation,
  useSendTextMessageMutation,
  type IChatMessage,
  type IConversation,
} from "@/redux/api/chatApi";
import { baseApi } from "@/redux/api/baseApi";
import { useAppDispatch } from "@/redux/hooks";
import { extractList } from "@/lib/taskStats";
import { apiErrorMessage, isApiSuccess } from "@/lib/apiError";
import { relativeTime } from "@/lib/notificationUi";

function participantLabel(
  c: IConversation,
  myId: string | undefined,
): string {
  if (c.type === "announcement") {
    return c.title || "Announcement";
  }
  const other = (c.participants || []).find((p) => p._id !== myId);
  return other?.name || other?.email || "Direct chat";
}

function senderName(m: IChatMessage) {
  if (!m.senderId || typeof m.senderId === "string") return "Someone";
  return m.senderId.name || m.senderId.email || "Someone";
}

function senderIdOf(m: IChatMessage) {
  if (!m.senderId) return "";
  return typeof m.senderId === "string" ? m.senderId : m.senderId._id;
}

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const focusId = searchParams.get("c") || "";
  const dispatch = useAppDispatch();
  const { socket } = useSocketContext();
  const { workspaceId, isAdmin, canManage, role } = useWorkspace();
  const { data: profile } = useGetMyProfileQuery(undefined);
  const myId = (profile?.data as { _id?: string } | undefined)?._id;

  const { data: convResult, isLoading: convLoading } = useGetConversationsQuery(
    workspaceId || undefined,
    { skip: !workspaceId },
  );
  const conversations = extractList<IConversation>(
    convResult?.data ?? convResult,
  );

  const [activeId, setActiveId] = useState<string>("");
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [sendText, { isLoading: sending }] = useSendTextMessageMutation();
  const [sendFile, { isLoading: uploading }] = useSendChatAttachmentMutation();

  useEffect(() => {
    if (focusId) setActiveId(focusId);
  }, [focusId]);

  useEffect(() => {
    if (!activeId && conversations.length) {
      setActiveId(conversations[0]._id);
    }
  }, [conversations, activeId]);

  const active = useMemo(
    () => conversations.find((c) => c._id === activeId) || null,
    [conversations, activeId],
  );

  const { data: msgResult, isLoading: msgLoading } = useGetMessagesQuery(
    activeId,
    {
      skip: !activeId,
      // Fallback if socket drops; primary updates come from socket invalidation
      pollingInterval: socket ? 30000 : 8000,
    },
  );

  const messages = useMemo(() => {
    const list = extractList<IChatMessage>(msgResult?.data ?? msgResult);
    return [...list].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return ta - tb;
    });
  }, [msgResult]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeId]);

  // Live thread: refetch when a chat notification arrives for this conversation
  useEffect(() => {
    if (!socket || !myId) return;

    const onChatEvent = (payload: unknown) => {
      const p = payload as {
        type?: string;
        data?: { conversationId?: string };
      };
      const conversationId = p?.data?.conversationId
        ? String(p.data.conversationId)
        : "";
      if (p?.type !== "message" && !conversationId) return;

      dispatch(
        baseApi.util.invalidateTags([
          "Conversation",
          "Message",
          ...(conversationId
            ? [{ type: "Message" as const, id: conversationId }]
            : []),
        ]),
      );
    };

    const events = [
      `new_message-${myId}`,
      `message-${myId}`,
      "notification",
      `notification-${myId}`,
    ];
    events.forEach((event) => socket.on(event, onChatEvent));
    return () => {
      events.forEach((event) => socket.off(event, onChatEvent));
    };
  }, [socket, myId, dispatch]);

  const canPost = active
    ? active.type === "announcement"
      ? isAdmin
      : true
    : false;

  const onSend = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!activeId || !text.trim()) return;
    const res = await sendText({
      conversationId: activeId,
      content: text.trim(),
    });
    if (isApiSuccess(res)) setText("");
    else toast.error(apiErrorMessage(res, "Could not send"));
  };

  const onUpload = async (file?: File) => {
    if (!file || !activeId) return;
    const res = await sendFile({
      conversationId: activeId,
      files: [file],
    });
    if (!isApiSuccess(res)) {
      toast.error(apiErrorMessage(res, "Upload failed"));
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const announcements = conversations.filter((c) => c.type === "announcement");
  const directs = conversations.filter((c) => c.type !== "announcement");

  return (
    <div className="dash-enter flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-ink/10 px-4 py-4 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Workspace chat
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-ink md:text-3xl">
              Messages
            </h1>
            <p className="mt-1 text-sm text-muted">
              Manager↔member chats
              {isAdmin
                ? " · admin announcement channels (post-only for admins)"
                : " · announcement channels (read)"}
              {role ? ` · you are ${role}` : ""}
            </p>
          </div>
          {canManage ? (
            <Link
              href="/dashboard/members"
              className="rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-paper"
            >
              Message someone from Members
            </Link>
          ) : null}
        </div>
      </div>

      {!workspaceId ? (
        <p className="px-4 py-8 text-sm text-muted md:px-6">
          Select a workspace to open chat.
        </p>
      ) : (
        <div className="grid min-h-0 flex-1 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside
            className={`min-h-0 overflow-y-auto border-b border-ink/10 bg-white lg:block lg:border-b-0 lg:border-r ${
              activeId ? "hidden" : "block"
            }`}
          >
            {convLoading ? (
              <div className="space-y-2 p-3">
                <div className="skeleton h-12 rounded-xl" />
                <div className="skeleton h-12 rounded-xl" />
              </div>
            ) : (
              <div className="p-2">
                {announcements.length ? (
                  <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                    Announcements
                  </p>
                ) : null}
                {announcements.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => setActiveId(c._id)}
                    className={`mb-1 flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left transition ${
                      activeId === c._id
                        ? "bg-ink text-paper"
                        : "hover:bg-mist"
                    }`}
                  >
                    <Megaphone
                      size={16}
                      className={`mt-0.5 shrink-0 ${
                        activeId === c._id ? "text-accent" : "text-muted"
                      }`}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {participantLabel(c, myId)}
                      </span>
                      <span
                        className={`mt-0.5 block truncate text-xs ${
                          activeId === c._id ? "text-white/60" : "text-muted"
                        }`}
                      >
                        {c.lastMessage || "No posts yet"}
                      </span>
                    </span>
                  </button>
                ))}

                <p className="px-2 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Direct
                </p>
                {directs.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-muted">
                    No direct chats yet. Open one from Members or a task
                    assignee.
                  </p>
                ) : (
                  directs.map((c) => (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => setActiveId(c._id)}
                      className={`mb-1 flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left transition ${
                        activeId === c._id
                          ? "bg-ink text-paper"
                          : "hover:bg-mist"
                      }`}
                    >
                      <MessageSquare
                        size={16}
                        className={`mt-0.5 shrink-0 ${
                          activeId === c._id ? "text-accent" : "text-muted"
                        }`}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">
                          {participantLabel(c, myId)}
                        </span>
                        <span
                          className={`mt-0.5 block truncate text-xs ${
                            activeId === c._id ? "text-white/60" : "text-muted"
                          }`}
                        >
                          {c.lastMessage || "Say hello"}
                        </span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </aside>

          <section
            className={`min-h-0 flex-col bg-mist/40 ${
              activeId ? "flex" : "hidden lg:flex"
            }`}
          >
            {!active ? (
              <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted">
                Pick a conversation
              </div>
            ) : (
              <>
                <div className="shrink-0 border-b border-ink/10 bg-white px-4 py-3">
                  <div className="mb-1 flex items-center gap-2 lg:hidden">
                    <button
                      type="button"
                      onClick={() => setActiveId("")}
                      className="rounded-lg border border-ink/15 px-2.5 py-1.5 text-xs font-semibold text-ink"
                    >
                      Back
                    </button>
                  </div>
                  <p className="font-display text-lg font-bold text-ink">
                    {participantLabel(active, myId)}
                  </p>
                  <p className="text-xs text-muted">
                    {active.type === "announcement"
                      ? isAdmin
                        ? "You can post announcements and documents here"
                        : "Read-only announcements from workspace admin"
                      : "Direct workspace chat"}
                    {active.lastMessageAt
                      ? ` · updated ${relativeTime(active.lastMessageAt)}`
                      : ""}
                  </p>
                </div>

                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
                  {msgLoading ? (
                    <div className="skeleton h-24 rounded-xl" />
                  ) : messages.length === 0 ? (
                    <p className="text-center text-sm text-muted">
                      No messages yet.
                    </p>
                  ) : (
                    messages.map((m) => {
                      const mine = senderIdOf(m) === myId;
                      return (
                        <div
                          key={m._id}
                          className={`flex ${mine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[min(100%,28rem)] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                              mine
                                ? "bg-ink text-paper"
                                : "border border-ink/10 bg-white text-ink"
                            }`}
                          >
                            {!mine ? (
                              <p
                                className={`mb-1 text-[11px] font-semibold ${
                                  mine ? "text-accent" : "text-muted"
                                }`}
                              >
                                {senderName(m)}
                              </p>
                            ) : null}
                            {m.content ? (
                              <p className="whitespace-pre-wrap leading-relaxed">
                                {m.content}
                              </p>
                            ) : null}
                            {m.attachments?.length ? (
                              <ul className="mt-2 space-y-1">
                                {m.attachments.map((a) => (
                                  <li key={a.url}>
                                    <a
                                      href={a.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className={`inline-flex items-center gap-1 text-xs font-semibold underline-offset-2 hover:underline ${
                                        mine ? "text-accent" : "text-ink"
                                      }`}
                                    >
                                      <Paperclip size={12} />
                                      {a.name || a.type}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                            <p
                              className={`mt-1 text-[10px] ${
                                mine ? "text-white/45" : "text-muted"
                              }`}
                            >
                              {relativeTime(m.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                <div className="shrink-0 border-t border-ink/10 bg-white px-4 py-3">
                  {canPost ? (
                    <form
                      onSubmit={(e) => void onSend(e)}
                      className="flex flex-wrap items-end gap-2"
                    >
                      <input
                        ref={fileRef}
                        type="file"
                        className="sr-only"
                        onChange={(e) =>
                          void onUpload(e.target.files?.[0])
                        }
                      />
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => fileRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-ink/15 px-3 py-2.5 text-sm font-semibold text-ink hover:bg-mist disabled:opacity-60"
                      >
                        <Upload size={16} />
                        {uploading ? "…" : "File"}
                      </button>
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={2}
                        placeholder={
                          active.type === "announcement"
                            ? "Post an announcement…"
                            : "Write a message…"
                        }
                        className="min-w-[12rem] flex-1 rounded-xl border border-ink/15 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            void onSend();
                          }
                        }}
                      />
                      <button
                        type="submit"
                        disabled={sending || !text.trim()}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-accent disabled:opacity-60"
                      >
                        <Send size={16} />
                        Send
                      </button>
                    </form>
                  ) : (
                    <p className="text-sm text-muted">
                      Only workspace admins can post in this announcement
                      channel.
                    </p>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
