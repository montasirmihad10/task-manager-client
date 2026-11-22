"use client";

import { useEffect, useState } from "react";
import { onMessage, Unsubscribe } from "firebase/messaging";
import { toast } from "sonner";
import { envConfig } from "@/config/envConfig";
import { getMessagingInstance } from "@/lib/firebase/firebase";
import { useSocketContext } from "@/components/providers/SocketProvider";
import { useGetMyProfileQuery } from "@/redux/api/authApi";
import { baseApi } from "@/redux/api/baseApi";
import { useAppDispatch } from "@/redux/hooks";
import { getClientToken } from "@/lib/auth/cookies.client";

const TASK_EVENTS = [
  "task_assigned",
  "task_updated",
  "comment",
  "workspace_invite",
  "general",
  "system",
  "alert",
  "account",
  "new_message",
  "message",
] as const;

const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { socket } = useSocketContext();
  const dispatch = useAppDispatch();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(Boolean(getClientToken()));
  }, []);

  const { data: profileResult } = useGetMyProfileQuery(undefined, {
    skip: !hasToken,
  });
  const userId = (profileResult?.data as { _id?: string } | undefined)?._id;

  // FCM foreground toasts
  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;

    const setupListener = async () => {
      if (typeof window === "undefined") return;
      if (!("serviceWorker" in navigator)) return;
      if (!envConfig.firebase.projectId || !envConfig.firebase.apiKey) return;

      try {
        await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
          scope: "/",
        });
        await navigator.serviceWorker.ready;

        const messaging = await getMessagingInstance();
        if (!messaging) return;

        unsubscribe = onMessage(messaging, (payload) => {
          const title = payload.notification?.title || "New notification";
          const body = payload.notification?.body || "";

          toast(title, {
            description: body,
            duration: 5000,
            position: "top-center",
          });
          dispatch(baseApi.util.invalidateTags(["notification"]));
        });
      } catch {
        // FCM optional — fail silently
      }
    };

    setupListener();

    return () => {
      unsubscribe?.();
    };
  }, [dispatch]);

  // Socket realtime — refresh inbox when events arrive for this user
  useEffect(() => {
    if (!socket || !userId) return;

    const handlers: Array<{ event: string; fn: (payload: unknown) => void }> =
      [];

    const refresh = (payload: unknown) => {
      const p = payload as {
        type?: string;
        title?: string;
        message?: string;
        data?: { conversationId?: string };
        notification?: { title?: string; message?: string };
      };
      const isChat =
        p?.type === "message" || Boolean(p?.data?.conversationId);

      dispatch(
        baseApi.util.invalidateTags(
          isChat
            ? [
                "notification",
                "Conversation",
                "Message",
                ...(p?.data?.conversationId
                  ? [
                      {
                        type: "Message" as const,
                        id: String(p.data.conversationId),
                      },
                    ]
                  : []),
              ]
            : ["notification"],
        ),
      );

      const title = p?.title || p?.notification?.title;
      const message = p?.message || p?.notification?.message;
      if (title) {
        toast(title, {
          description: message,
          duration: 4500,
        });
      }
    };

    for (const type of TASK_EVENTS) {
      const event = `${type}-${userId}`;
      socket.on(event, refresh);
      handlers.push({ event, fn: refresh });
    }

    // Broad catch-alls used by emitters
    const generic = `notification-${userId}`;
    socket.on(generic, refresh);
    handlers.push({ event: generic, fn: refresh });
    socket.on("notification", refresh);
    handlers.push({ event: "notification", fn: refresh });

    return () => {
      handlers.forEach(({ event, fn }) => socket.off(event, fn));
    };
  }, [socket, userId, dispatch]);

  return <>{children}</>;
};

export default NotificationProvider;
