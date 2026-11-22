import { baseApi } from "./baseApi";

export type ILegalDocument = {
  _id?: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
};

const settingsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getAbout: build.query({
      query: () => ({ url: "/settings/about", method: "GET" }),
      providesTags: ["about"],
    }),
    getPrivacy: build.query({
      query: () => ({ url: "/settings/privacy", method: "GET" }),
      providesTags: ["privacy"],
    }),
    getTerms: build.query({
      query: () => ({ url: "/settings/terms", method: "GET" }),
      providesTags: ["terms"],
    }),

    updateAbout: build.mutation({
      query: (data: { description: string }) => ({
        url: "/settings/about/update",
        method: "PATCH",
        contentType: "application/json",
        data,
      }),
      invalidatesTags: ["about"],
    }),
    updatePrivacy: build.mutation({
      query: (data: { description: string }) => ({
        url: "/settings/privacy/update",
        method: "PATCH",
        contentType: "application/json",
        data,
      }),
      invalidatesTags: ["privacy"],
    }),
    updateTerms: build.mutation({
      query: (data: { description: string }) => ({
        url: "/settings/terms/update",
        method: "PATCH",
        contentType: "application/json",
        data,
      }),
      invalidatesTags: ["terms"],
    }),
  }),
});

export const {
  useGetAboutQuery,
  useGetPrivacyQuery,
  useGetTermsQuery,
  useUpdateAboutMutation,
  useUpdatePrivacyMutation,
  useUpdateTermsMutation,
} = settingsApi;

export default settingsApi;
