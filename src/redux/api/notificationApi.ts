import { baseApi } from "./baseApi";

export type TNotificationType =
  | "system"
  | "message"
  | "alert"
  | "account"
  | "user_registration"
  | "general"
  | "task_assigned"
  | "task_updated"
  | "comment"
  | "workspace_invite";

export interface INotification {
  _id: string;
  title: string;
  message: string;
  type: TNotificationType | string;
  isRead: boolean;
  createdAt?: string;
  data?: {
    taskId?: string;
    workspaceId?: string;
    [key: string]: unknown;
  };
  sender?:
    | string
    | null
    | {
        _id: string;
        name?: string;
        email?: string;
        profileImage?: string | { url?: string };
      };
}

interface IGetNotificationsParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
  sort?: string;
}

const notificationApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getMyNotifications: build.query({
      query: (params?: IGetNotificationsParams) => ({
        url: "/notification/",
        method: "GET",
        params: {
          sort: "-createdAt",
          limit: 20,
          ...params,
          ...(params?.isRead === undefined
            ? {}
            : { isRead: String(params.isRead) }),
        },
      }),
      providesTags: ["notification"],
    }),

    getUnreadCount: build.query({
      query: () => ({
        url: "/notification/unread-count",
        method: "GET",
      }),
      providesTags: ["notification"],
    }),

    markNotificationAsRead: build.mutation({
      query: (id: string) => ({
        url: `/notification/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["notification"],
    }),

    markAllNotificationsAsRead: build.mutation({
      query: (_arg?: void) => ({
        url: `/notification/read-all`,
        method: "PATCH",
      }),
      invalidatesTags: ["notification"],
    }),
  }),
});

export const {
  useGetMyNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} = notificationApi;

export default notificationApi;
