import { baseApi } from "./baseApi";

export interface IProject {
  _id: string;
  workspaceId: string;
  name: string;
  description?: string;
  status: "active" | "archived" | "completed";
  createdBy?: string;
}

const projectApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getProjects: build.query({
      query: (workspaceId: string) => ({
        url: "/projects",
        method: "GET",
        params: { workspaceId },
      }),
      providesTags: ["Project"],
    }),

    createProject: build.mutation({
      query: (data: {
        workspaceId: string;
        name: string;
        description?: string;
      }) => ({
        url: "/projects",
        method: "POST",
        contentType: "application/json",
        data,
      }),
      invalidatesTags: ["Project", "Dashboard"],
    }),

    updateProject: build.mutation({
      query: ({
        id,
        ...data
      }: {
        id: string;
        name?: string;
        description?: string;
        status?: IProject["status"];
        workspaceId?: string;
      }) => ({
        url: `/projects/${id}`,
        method: "PATCH",
        contentType: "application/json",
        data,
      }),
      invalidatesTags: ["Project", "Dashboard"],
    }),

    deleteProject: build.mutation({
      query: ({ id, workspaceId }: { id: string; workspaceId: string }) => ({
        url: `/projects/${id}`,
        method: "DELETE",
        params: { workspaceId },
      }),
      invalidatesTags: ["Project", "Dashboard"],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectApi;
export default projectApi;
