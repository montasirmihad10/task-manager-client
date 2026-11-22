import { baseApi } from "./baseApi";

export type TWorkspaceRole = "admin" | "manager" | "member";

export interface IWorkspace {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  ownerId?: string;
  isPersonal?: boolean;
  membershipRole?: TWorkspaceRole;
  membershipId?: string;
}

export interface IWorkspaceMember {
  _id: string;
  workspaceId: string;
  role: TWorkspaceRole;
  status: string;
  userId:
    | string
    | {
        _id: string;
        name?: string;
        email: string;
        profileImage?: string | { url?: string };
      };
}

export interface IWorkspaceStatus {
  _id: string;
  workspaceId: string;
  key: string;
  label: string;
  color: string;
  order: number;
  isDone?: boolean;
  isDefault?: boolean;
}

const workspaceApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getMyWorkspaces: build.query({
      query: () => ({ url: "/workspaces", method: "GET" }),
      providesTags: ["Workspace"],
    }),

    getWorkspace: build.query({
      query: (id: string) => ({ url: `/workspaces/${id}`, method: "GET" }),
      providesTags: ["Workspace"],
    }),

    createWorkspace: build.mutation({
      query: (data: { name: string; description?: string }) => ({
        url: "/workspaces",
        method: "POST",
        contentType: "application/json",
        data,
      }),
      invalidatesTags: ["Workspace", "Dashboard"],
    }),

    getWorkspaceMembers: build.query({
      query: (workspaceId: string) => ({
        url: `/workspaces/${workspaceId}/members`,
        method: "GET",
      }),
      providesTags: ["Workspace"],
    }),

    inviteWorkspaceMember: build.mutation({
      query: ({
        workspaceId,
        email,
        role,
      }: {
        workspaceId: string;
        email: string;
        role?: "manager" | "member";
      }) => ({
        url: `/workspaces/${workspaceId}/members`,
        method: "POST",
        contentType: "application/json",
        data: { email, role },
      }),
      invalidatesTags: ["Workspace", "Invite"],
    }),

    updateMemberRole: build.mutation({
      query: ({
        workspaceId,
        memberId,
        role,
      }: {
        workspaceId: string;
        memberId: string;
        role: TWorkspaceRole;
      }) => ({
        url: `/workspaces/${workspaceId}/members/${memberId}`,
        method: "PATCH",
        contentType: "application/json",
        data: { role },
      }),
      invalidatesTags: ["Workspace"],
    }),

    removeMember: build.mutation({
      query: ({
        workspaceId,
        memberId,
      }: {
        workspaceId: string;
        memberId: string;
      }) => ({
        url: `/workspaces/${workspaceId}/members/${memberId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Workspace"],
    }),

    getWorkspaceStatuses: build.query({
      query: (workspaceId: string) => ({
        url: "/statuses",
        method: "GET",
        params: { workspaceId },
      }),
      providesTags: ["Status"],
    }),

    createWorkspaceStatus: build.mutation({
      query: (data: {
        workspaceId: string;
        key: string;
        label: string;
        color?: string;
        order?: number;
      }) => ({
        url: "/statuses",
        method: "POST",
        contentType: "application/json",
        data,
      }),
      invalidatesTags: ["Status", "Task"],
    }),

    updateWorkspaceStatus: build.mutation({
      query: ({
        id,
        ...data
      }: {
        id: string;
        label?: string;
        color?: string;
        order?: number;
        isDone?: boolean;
      }) => ({
        url: `/statuses/${id}`,
        method: "PATCH",
        contentType: "application/json",
        data,
      }),
      invalidatesTags: ["Status", "Task"],
    }),

    deleteWorkspaceStatus: build.mutation({
      query: (id: string) => ({
        url: `/statuses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Status", "Task"],
    }),

    updateWorkspace: build.mutation({
      query: ({
        id,
        ...data
      }: {
        id: string;
        name?: string;
        description?: string;
      }) => ({
        url: `/workspaces/${id}`,
        method: "PATCH",
        contentType: "application/json",
        data,
      }),
      invalidatesTags: ["Workspace", "Dashboard"],
    }),

    createInviteLink: build.mutation({
      query: (data: {
        workspaceId: string;
        email: string;
        role?: "manager" | "member";
      }) => ({
        url: "/invites",
        method: "POST",
        contentType: "application/json",
        data,
      }),
      invalidatesTags: ["Invite"],
    }),

    inviteWithCredentials: build.mutation({
      query: (data: {
        workspaceId: string;
        email: string;
        name?: string;
        role?: "manager" | "member";
      }) => ({
        url: "/invites/with-credentials",
        method: "POST",
        contentType: "application/json",
        data,
      }),
      invalidatesTags: ["Invite", "Workspace"],
    }),

    listInvites: build.query({
      query: (workspaceId: string) => ({
        url: "/invites",
        method: "GET",
        params: { workspaceId },
      }),
      providesTags: ["Invite"],
    }),

    getDashboardMe: build.query({
      query: () => ({ url: "/dashboard/me", method: "GET" }),
      providesTags: ["Dashboard", "Workspace"],
    }),

    getWorkspaceSummary: build.query({
      query: (workspaceId: string) => ({
        url: "/dashboard/workspace",
        method: "GET",
        params: { workspaceId },
      }),
      providesTags: ["Dashboard", "Task"],
    }),

    /** Platform admin — org-wide totals (not workspace-scoped) */
    getPlatformSummary: build.query({
      query: () => ({ url: "/dashboard/platform", method: "GET" }),
      providesTags: ["Dashboard", "Task", "Workspace"],
    }),

    getBillingStatus: build.query({
      query: () => ({ url: "/billing/status", method: "GET" }),
      providesTags: ["Billing"],
    }),
  }),
});

export const {
  useGetMyWorkspacesQuery,
  useGetWorkspaceQuery,
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
  useGetWorkspaceMembersQuery,
  useInviteWorkspaceMemberMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
  useGetWorkspaceStatusesQuery,
  useCreateWorkspaceStatusMutation,
  useUpdateWorkspaceStatusMutation,
  useDeleteWorkspaceStatusMutation,
  useCreateInviteLinkMutation,
  useInviteWithCredentialsMutation,
  useListInvitesQuery,
  useGetDashboardMeQuery,
  useGetWorkspaceSummaryQuery,
  useGetPlatformSummaryQuery,
  useGetBillingStatusQuery,
} = workspaceApi;

export default workspaceApi;
