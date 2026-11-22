import { baseApi } from "./baseApi";

export type ILandingPillar = {
  title: string;
  body: string;
  image: string;
  moreInfo?: string;
  iconKey?: string;
};

export type ILandingStage = {
  name: string;
  detail: string;
  moreInfo?: string;
  image?: string;
};

export type ILandingRoleCard = {
  key: string;
  eyebrow: string;
  title: string;
  summary: string;
  points: string[];
  ctaLabel?: string;
  ctaHref?: string;
};

export type ILandingContent = {
  _id?: string;
  hero: {
    brand: string;
    headline: string;
    subhead: string;
    primaryCta: string;
    secondaryCta: string;
    bannerImage: string;
    accentImage?: string;
  };
  roles?: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cards: ILandingRoleCard[];
  };
  product: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: ILandingPillar[];
  };
  pipeline: {
    eyebrow: string;
    title: string;
    subtitle: string;
    image?: string;
    stages: ILandingStage[];
  };
  legal: {
    eyebrow: string;
    title: string;
    subtitle: string;
    docs: Array<{
      slug: string;
      title: string;
      blurb: string;
      coverImage: string;
    }>;
  };
  close: {
    eyebrow: string;
    title: string;
    subtitle: string;
    backgroundImage: string;
    primaryCta: string;
    secondaryCta: string;
  };
};

const landingApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getLanding: build.query({
      query: () => ({
        url: "/settings/landing",
        method: "GET",
      }),
      providesTags: ["Landing"],
    }),

    updateLanding: build.mutation({
      query: (data: Partial<ILandingContent>) => ({
        url: "/settings/landing",
        method: "PATCH",
        contentType: "application/json",
        data,
      }),
      invalidatesTags: ["Landing"],
    }),

    uploadLandingImage: build.mutation({
      query: (file: File) => {
        const form = new FormData();
        form.append("file", file);
        return {
          url: "/settings/landing/upload",
          method: "POST",
          data: form,
        };
      },
    }),
  }),
});

export const {
  useGetLandingQuery,
  useUpdateLandingMutation,
  useUploadLandingImageMutation,
} = landingApi;

export default landingApi;
