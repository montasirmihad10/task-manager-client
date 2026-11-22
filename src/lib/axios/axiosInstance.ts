import { TResponse } from "@/types";
import axios from "axios";
import { clearAccessToken, getAccessToken } from "@/lib/auth/token";
import { envConfig } from "@/config/envConfig";

const axiosInstance = axios.create({
  baseURL: envConfig.baseApi || undefined,
  timeout: 60000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers = config.headers ?? {};
      if (typeof config.headers.set === "function") {
        config.headers.set("Authorization", `Bearer ${accessToken}`);
      } else {
        (config.headers as Record<string, string>).Authorization =
          `Bearer ${accessToken}`;
      }
    }

    // Let the browser set multipart boundary for FormData uploads
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      if (typeof config.headers?.set === "function") {
        config.headers.set("Content-Type", false as unknown as string);
      } else if (config.headers) {
        delete (config.headers as Record<string, unknown>)["Content-Type"];
        delete (config.headers as Record<string, unknown>)["content-type"];
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => {
    // Preserve binary downloads (CSV export, etc.)
    if (
      response.config.responseType === "blob" ||
      response.config.responseType === "arraybuffer"
    ) {
      return response;
    }

    const responseObject: TResponse = {
      data: response?.data,
      meta: response?.data?.meta,
    };
    // Keep axios shape usable: attach custom fields but preserve status
    return Object.assign(response, {
      data: responseObject.data,
      meta: responseObject.meta,
    });
  },
  async (error) => {
    const status = error.response?.status;
    const hadAuthHeader = Boolean(
      error.config?.headers?.Authorization ||
        error.config?.headers?.authorization,
    );

    // Only wipe session if we actually sent a token and backend rejected it
    if (status === 401 && hadAuthHeader && typeof window !== "undefined") {
      clearAccessToken();
    }

    const responseError = {
      statusCode: status,
      message: error.response?.data?.message || "Something went wrong",
      errorMessages: error.response?.data?.message,
    };

    return Promise.reject({
      response: {
        status,
        data: responseError,
      },
    });
  },
);

export { axiosInstance };
