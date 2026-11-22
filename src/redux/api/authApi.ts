import { baseApi } from "./baseApi";

const authApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    loginUser: build.mutation({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        contentType: "application/json",
        data,
      }),
      invalidatesTags: ["auth"],
    }),

    logoutUser: build.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["auth", "user", "Task"],
    }),

    signUpUser: build.mutation({
      query: (data) => ({
        url: "/auth/create",
        method: "POST",
        contentType: "application/json",
        data,
      }),
      invalidatesTags: ["auth"],
    }),

    forgetPassword: build.mutation({
      query: (data) => ({
        url: "/auth/forget-password",
        method: "POST",
        contentType: "application/json",
        data,
      }),
      invalidatesTags: ["auth"],
    }),

    verifyOtp: build.mutation({
      query: (data) => ({
        url: "/auth/verify-otp",
        method: "POST",
        contentType: "application/json",
        data,
      }),
      invalidatesTags: ["auth"],
    }),

    resetPassword: build.mutation({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        contentType: "application/json",
        data,
      }),
      invalidatesTags: ["auth"],
    }),

    changePassword: build.mutation({
      query: (data) => ({
        url: "/auth/change-password",
        method: "POST",
        contentType: "application/json",
        data,
      }),
      invalidatesTags: ["auth"],
    }),

    resendOtp: build.mutation({
      query: (email) => ({
        url: `/auth/resend-otp/${email}`,
        method: "POST",
      }),
      invalidatesTags: ["auth"],
    }),

    /** Get currently logged-in user's profile */
    getMyProfile: build.query({
      query: (_arg?: void) => ({
        url: "/users/me",
        method: "GET",
      }),
      providesTags: ["auth", "user"],
    }),

    /** Update name / phone / avatar (multipart: data JSON + optional image) */
    editMyProfile: build.mutation({
      query: ({
        name,
        phone,
        image,
      }: {
        name?: string;
        phone?: string;
        image?: File | null;
      }) => {
        const form = new FormData();
        form.append(
          "data",
          JSON.stringify({
            ...(name !== undefined ? { name } : {}),
            ...(phone !== undefined ? { phone } : {}),
          }),
        );
        if (image) form.append("image", image);
        return {
          url: "/users/edit-profile",
          method: "PATCH",
          data: form,
        };
      },
      invalidatesTags: ["auth", "user"],
    }),
  }),
});

export const {
  useLoginUserMutation,
  useLogoutUserMutation,
  useSignUpUserMutation,
  useForgetPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useResendOtpMutation,
  useGetMyProfileQuery,
  useEditMyProfileMutation,
} = authApi;
