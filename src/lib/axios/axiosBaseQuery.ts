import { IMeta } from "@/types";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosRequestConfig } from "axios";
import { axiosInstance } from "./axiosInstance";

type ErrorShape = {
  status?: number;
  data?: unknown;
};

export const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: "" },
  ): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig["method"];
      data?: AxiosRequestConfig["data"];
      params?: AxiosRequestConfig["params"];
      headers?: AxiosRequestConfig["headers"];
      meta?: IMeta;
      contentType?: string;
    },
    unknown,
    ErrorShape
  > =>
  async ({ url, method, data, params, headers, contentType }) => {
    try {
      const isFormData =
        typeof FormData !== "undefined" && data instanceof FormData;

      const result = await axiosInstance({
        url: `${baseUrl}${url}`,
        method,
        data,
        params,
        headers: {
          ...(isFormData
            ? { "Content-Type": undefined as unknown as string }
            : contentType
              ? { "Content-Type": contentType }
              : {}),
          ...headers,
        },
      });

      // result.data is backend JSON: { success, message, data, meta }
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as {
        response?: { status?: number; data?: unknown };
      };
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || "Something went wrong",
        },
      };
    }
  };
