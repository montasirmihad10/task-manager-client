import { baseApi } from "./baseApi";

/** Legacy keys + any custom workspace status key */
export type TTaskStatus = string;

export interface ITask {
  _id: string;
  title: string;
  assignTo: string;
  status: TTaskStatus;
  start_date: string;
  end_date: string;
  userEmail: string;
  email?: string;
  workspaceId?: string | null;
  projectId?: string | null;
  createdBy?: string | null;
  assigneeId?:
    | string
    | null
    | { _id: string; name?: string; email?: string; profileImage?: unknown };
  description?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  labels?: string[];
  dueDate?: string | null;
  estimateHours?: number | null;
  isArchived?: boolean;
}

export interface ITaskStat {
  _id: TTaskStatus | string;
  count: number;
}

export interface ISearchFilterResult {
  tasks: TTaskStatus[];
  result: ITask[];
}

export interface ITaskDetail {
  task: ITask;
  comments: Array<{
    _id: string;
    body: string;
    authorId?: { _id: string; name?: string; email?: string };
    createdAt?: string;
  }>;
  documents: Array<{
    _id: string;
    name: string;
    url: string;
    mimeType?: string;
  }>;
  subtasks: Array<{
    _id: string;
    title: string;
    isDone: boolean;
    order: number;
  }>;
  activity: Array<{
    _id: string;
    action: string;
    createdAt?: string;
    actorId?: { name?: string; email?: string };
    meta?: Record<string, unknown>;
  }>;
  checklist: { total: number; done: number };
}

const taskApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getTasks: build.query({
      query: (params?: {
        email?: string;
        workspaceId?: string;
        projectId?: string;
        status?: string;
      }) => ({
        url: "/tasks",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["Task"],
    }),

    getUserTasks: build.query({
      query: (email: string) => ({
        url: "/tasks",
        method: "GET",
        params: { email },
      }),
      providesTags: ["Task"],
    }),

    getWorkspaceTasks: build.query({
      query: (workspaceId: string) => ({
        url: "/tasks",
        method: "GET",
        params: { workspaceId },
      }),
      providesTags: ["Task"],
    }),

    addTask: build.mutation({
      query: (data) => ({
        url: "/tasks",
        method: "POST",
        contentType: "application/json",
        data,
      }),
      invalidatesTags: ["Task", "Dashboard"],
    }),

    findTask: build.query({
      query: (id: string) => ({
        url: `/tasks/${id}`,
        method: "GET",
      }),
      providesTags: ["Task"],
    }),

    getTaskDetail: build.query({
      query: (id: string) => ({
        url: `/tasks/${id}/detail`,
        method: "GET",
      }),
      providesTags: ["Task", "Comment", "Subtask", "Document"],
    }),

    editTask: build.mutation({
      query: ({ id, ...data }: { id: string } & Partial<ITask>) => ({
        url: `/tasks/${id}`,
        method: "PATCH",
        contentType: "application/json",
        data,
      }),
      invalidatesTags: ["Task", "Dashboard"],
    }),

    deleteTask: build.mutation({
      query: (id: string) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Task", "Dashboard"],
    }),

    updateStatus: build.mutation({
      query: ({ id, status }: { id: string; status: TTaskStatus }) => ({
        url: `/tasks/${id}/status`,
        method: "PATCH",
        contentType: "application/json",
        data: { status },
      }),
      invalidatesTags: ["Task", "Dashboard"],
    }),

    assignTask: build.mutation({
      query: ({ id, assigneeId }: { id: string; assigneeId: string }) => ({
        url: `/tasks/${id}/assign`,
        method: "PATCH",
        contentType: "application/json",
        data: { assigneeId },
      }),
      invalidatesTags: ["Task"],
    }),

    updateStatusButton: build.mutation({
      query: ({
        id,
        updateStatus,
      }: {
        id: string;
        updateStatus?: string;
      }) => ({
        url: `/tasks/${id}/status/forward`,
        method: "PATCH",
        contentType: "application/json",
        data: { updateStatus },
      }),
      invalidatesTags: ["Task", "Dashboard"],
    }),

    updateBackStatusButton: build.mutation({
      query: ({
        id,
        updateBackStatus,
      }: {
        id: string;
        updateBackStatus?: string;
      }) => ({
        url: `/tasks/${id}/status/back`,
        method: "PATCH",
        contentType: "application/json",
        data: { updateBackStatus },
      }),
      invalidatesTags: ["Task", "Dashboard"],
    }),

    getTaskStats: build.query({
      query: (params?: { email?: string; workspaceId?: string } | void) => ({
        url: "/tasks/stats",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["Task"],
    }),

    searchFilterTasks: build.query({
      query: ({
        status,
        title,
        email,
        workspaceId,
      }: {
        status?: string;
        title?: string;
        email?: string;
        workspaceId?: string;
      }) => ({
        url: "/tasks/search-filter",
        method: "GET",
        params: {
          ...(status ? { status } : {}),
          ...(title ? { title } : {}),
          ...(email ? { email } : {}),
          ...(workspaceId ? { workspaceId } : {}),
        },
      }),
      providesTags: ["Task"],
    }),

    filterTasks: build.query({
      query: (params: {
        workspaceId: string;
        mine?: boolean | string;
        due?: "overdue" | "today" | "week" | "none";
        status?: string;
        priority?: string;
        assigneeId?: string;
        projectId?: string;
        search?: string;
        includeArchived?: boolean;
      }) => ({
        url: "/tasks/filter",
        method: "GET",
        params,
      }),
      providesTags: ["Task"],
    }),

    addComment: build.mutation({
      query: ({
        id,
        body,
        mentionIds,
      }: {
        id: string;
        body: string;
        mentionIds?: string[];
      }) => ({
        url: `/tasks/${id}/comments`,
        method: "POST",
        contentType: "application/json",
        data: { body, mentionIds },
      }),
      invalidatesTags: ["Comment", "Task"],
    }),

    addSubtask: build.mutation({
      query: ({ id, title }: { id: string; title: string }) => ({
        url: `/tasks/${id}/subtasks`,
        method: "POST",
        contentType: "application/json",
        data: { title },
      }),
      invalidatesTags: ["Subtask", "Task"],
    }),

    updateSubtask: build.mutation({
      query: ({
        id,
        subtaskId,
        ...data
      }: {
        id: string;
        subtaskId: string;
        title?: string;
        isDone?: boolean;
      }) => ({
        url: `/tasks/${id}/subtasks/${subtaskId}`,
        method: "PATCH",
        contentType: "application/json",
        data,
      }),
      invalidatesTags: ["Subtask", "Task"],
    }),

    getCalendarTasks: build.query({
      query: ({
        workspaceId,
        from,
        to,
      }: {
        workspaceId: string;
        from: string;
        to: string;
      }) => ({
        url: "/tasks/calendar",
        method: "GET",
        params: { workspaceId, from, to },
      }),
      providesTags: ["Task"],
    }),

    bulkUpdateTasks: build.mutation({
      query: (data: {
        workspaceId: string;
        taskIds: string[];
        status?: string;
        assigneeId?: string | null;
        priority?: string;
        projectId?: string | null;
        archive?: boolean;
      }) => ({
        url: "/tasks/bulk",
        method: "POST",
        contentType: "application/json",
        data,
      }),
      invalidatesTags: ["Task", "Dashboard"],
    }),

    getUsers: build.query({
      query: (_arg?: void) => ({
        url: "/users",
        method: "GET",
      }),
      providesTags: ["user"],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetUserTasksQuery,
  useGetWorkspaceTasksQuery,
  useAddTaskMutation,
  useFindTaskQuery,
  useGetTaskDetailQuery,
  useEditTaskMutation,
  useDeleteTaskMutation,
  useUpdateStatusMutation,
  useAssignTaskMutation,
  useUpdateStatusButtonMutation,
  useUpdateBackStatusButtonMutation,
  useGetTaskStatsQuery,
  useSearchFilterTasksQuery,
  useFilterTasksQuery,
  useAddCommentMutation,
  useAddSubtaskMutation,
  useUpdateSubtaskMutation,
  useGetCalendarTasksQuery,
  useBulkUpdateTasksMutation,
  useGetUsersQuery,
} = taskApi;

export default taskApi;
