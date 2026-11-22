import {
  clearAccessToken,
  extractAccessToken,
  setAccessToken,
} from "./token";
import { store } from "@/redux/store";
import { baseApi } from "@/redux/api/baseApi";
import { axiosInstance } from "@/lib/axios/axiosInstance";

export function handleLoginSuccess(tokenOrPayload: string | unknown): void {
  const token =
    typeof tokenOrPayload === "string"
      ? tokenOrPayload
      : extractAccessToken(tokenOrPayload);

  if (!token) {
    throw new Error("Login succeeded but no access token was returned");
  }

  setAccessToken(token);
}

export async function handleLogout(): Promise<void> {
  try {
    await axiosInstance.post("/auth/logout", {});
  } catch {
    // still clear local session
  }

  clearAccessToken();
  store.dispatch(baseApi.util.resetApiState());
}
