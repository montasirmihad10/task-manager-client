import { baseApi } from "./baseApi";

export interface ILabel {
  _id: string;
  workspaceId: string;
  name: string;
  color: string;
}

const labelApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getLabels: build.query({
      query: (workspaceId: string) => ({
        url: "/labels",
        method: "GET",
        params: { workspaceId },
      }),
      providesTags: ["Label"],
    }),

    createLabel: build.mutation({
      query: (data: { workspaceId: string; name: string; color?: string }) => ({
        url: "/labels",
        method: "POST",
        contentType: "application/json",
        data,
      }),
      invalidatesTags: ["Label"],
    }),

    updateLabel: build.mutation({
      query: ({
        id,
        ...data
      }: {
        id: string;
        name?: string;
        color?: string;
      }) => ({
        url: `/labels/${id}`,
        method: "PATCH",
        contentType: "application/json",
        data,
      }),
      invalidatesTags: ["Label"],
    }),

    deleteLabel: build.mutation({
      query: (id: string) => ({
        url: `/labels/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Label"],
    }),
  }),
});

export const {
  useGetLabelsQuery,
  useCreateLabelMutation,
  useUpdateLabelMutation,
  useDeleteLabelMutation,
} = labelApi;

export default labelApi;
