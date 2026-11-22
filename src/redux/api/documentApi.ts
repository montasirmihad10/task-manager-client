import { baseApi } from "./baseApi";

const documentApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    uploadDocument: build.mutation({
      query: ({
        file,
        workspaceId,
        taskId,
        projectId,
        name,
      }: {
        file: File;
        workspaceId: string;
        taskId?: string;
        projectId?: string;
        name?: string;
      }) => {
        const form = new FormData();
        form.append("file", file);
        form.append("workspaceId", workspaceId);
        if (taskId) form.append("taskId", taskId);
        if (projectId) form.append("projectId", projectId);
        if (name) form.append("name", name);
        return {
          url: "/documents",
          method: "POST",
          data: form,
        };
      },
      invalidatesTags: ["Document", "Task"],
    }),

    listDocuments: build.query({
      query: (params: {
        workspaceId: string;
        taskId?: string;
        projectId?: string;
      }) => ({
        url: "/documents",
        method: "GET",
        params,
      }),
      providesTags: ["Document"],
    }),
  }),
});

export const { useUploadDocumentMutation, useListDocumentsQuery } =
  documentApi;

export default documentApi;
