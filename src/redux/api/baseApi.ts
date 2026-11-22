import { createApi } from "@reduxjs/toolkit/query/react";
import { envConfig } from "../../config/envConfig";
import { axiosBaseQuery } from "@/lib/axios/axiosBaseQuery";

export const baseApi = createApi({
  reducerPath: "api",
  tagTypes: [
    "auth",
    "user",
    "admin",
    "notification",
    "terms",
    "privacy",
    "about",
    "Task",
    "Workspace",
    "Project",
    "Status",
    "Label",
    "Invite",
    "Dashboard",
    "Comment",
    "Subtask",
    "Document",
    "Billing",
    "Landing",
    "Conversation",
    "Message",
  ],
  baseQuery: axiosBaseQuery({
    baseUrl: envConfig.baseApi as string,
  }),
  endpoints: () => ({}),
});
