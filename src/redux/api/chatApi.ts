import { baseApi } from "./baseApi";

export type IChatParticipant = {
  _id: string;
  name?: string;
  email?: string;
  profileImage?: string | { url?: string };
  role?: string;
};

export type IConversation = {
  _id: string;
  type?: "direct" | "announcement";
  workspaceId?: string;
  announcementKind?: "admin_managers" | "admin_members" | null;
  title?: string | null;
  adminOnlyPost?: boolean;
  participants: IChatParticipant[];
  lastMessage?: string | null;
  lastMessageAt?: string | null;
};

export type IChatAttachment = {
  url: string;
  type: "image" | "audio" | "document" | "video";
  name: string;
  size?: number;
};

export type IChatMessage = {
  _id: string;
  conversationId: string;
  senderId: IChatParticipant | string;
  content?: string;
  messageType: "text" | "image" | "audio" | "document" | "location";
  attachments?: IChatAttachment[];
  isRead?: boolean;
  createdAt?: string;
};

const chatApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getConversations: build.query({
      query: (workspaceId?: string) => ({
        url: "/conversations",
        method: "GET",
        params: workspaceId ? { workspaceId } : undefined,
      }),
      providesTags: ["Conversation"],
    }),

    ensureChatChannels: build.mutation({
      query: (workspaceId: string) => ({
        url: "/conversations/ensure-channels",
        method: "POST",
        contentType: "application/json",
        data: { workspaceId },
      }),
      invalidatesTags: ["Conversation"],
    }),

    openDirectChat: build.mutation({
      query: (body: { workspaceId: string; recipientId: string }) => ({
        url: "/conversations",
        method: "POST",
        contentType: "application/json",
        data: body,
      }),
      invalidatesTags: ["Conversation"],
    }),

    getMessages: build.query({
      query: (conversationId: string) => ({
        url: `/messages/${conversationId}`,
        method: "GET",
        params: { sort: "createdAt", limit: 100 },
      }),
      providesTags: (_r, _e, id) => [{ type: "Message", id }],
    }),

    sendTextMessage: build.mutation({
      query: (body: { conversationId: string; content: string }) => ({
        url: `/messages/${body.conversationId}/send-text`,
        method: "POST",
        contentType: "application/json",
        data: { content: body.content },
      }),
      invalidatesTags: (_r, _e, arg) => [
        "Conversation",
        { type: "Message", id: arg.conversationId },
      ],
    }),

    sendChatAttachment: build.mutation({
      query: ({
        conversationId,
        files,
        content,
      }: {
        conversationId: string;
        files: File[];
        content?: string;
      }) => {
        const form = new FormData();
        files.forEach((f) => form.append("files", f));
        if (content) form.append("data", JSON.stringify({ content }));
        return {
          url: `/messages/${conversationId}/attachment`,
          method: "POST",
          data: form,
        };
      },
      invalidatesTags: (_r, _e, arg) => [
        "Conversation",
        { type: "Message", id: arg.conversationId },
      ],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useEnsureChatChannelsMutation,
  useOpenDirectChatMutation,
  useGetMessagesQuery,
  useSendTextMessageMutation,
  useSendChatAttachmentMutation,
} = chatApi;

export default chatApi;
