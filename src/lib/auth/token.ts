import Cookies from "js-cookie";
import { AUTH_CONFIG } from "./auth.config";

const STORAGE_KEY = "accessToken";
export const AUTH_CHANGED_EVENT = "tm-auth-changed";

function canUseDom() {
  return typeof window !== "undefined";
}

function notifyAuthChanged() {
  if (!canUseDom()) return;
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

/** Read access token — localStorage first, cookie fallback */
export function getAccessToken(): string | null {
  if (!canUseDom()) return null;

  try {
    const fromStorage = window.localStorage.getItem(STORAGE_KEY);
    if (fromStorage) return fromStorage;
  } catch {
    // ignore storage errors
  }

  return Cookies.get(AUTH_CONFIG.TOKEN_COOKIE_KEY) || null;
}

/** Persist token for axios (localStorage) + Next proxy (cookie) */
export function setAccessToken(token: string): void {
  if (!canUseDom() || !token) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // ignore
  }

  Cookies.set(AUTH_CONFIG.TOKEN_COOKIE_KEY, token, {
    expires: AUTH_CONFIG.COOKIE_EXPIRES_DAYS,
    path: AUTH_CONFIG.COOKIE_PATH,
    sameSite: "lax",
    secure: window.location.protocol === "https:",
  });

  notifyAuthChanged();
}

/** Clear all client-side session token copies */
export function clearAccessToken(): void {
  if (!canUseDom()) return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem("access-token"); // legacy key
  } catch {
    // ignore
  }

  const key = AUTH_CONFIG.TOKEN_COOKIE_KEY;
  const path = AUTH_CONFIG.COOKIE_PATH;
  Cookies.remove(key);
  Cookies.remove(key, { path });
  Cookies.remove(key, { path, sameSite: "lax" });
  Cookies.remove(key, { path, sameSite: "lax", secure: true });
  Cookies.remove(key, { path, sameSite: "lax", secure: false });

  document.cookie = `${key}=; Max-Age=0; path=${path}`;
  document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;

  notifyAuthChanged();
}

/**
 * Pull accessToken out of common RTK/axios response shapes.
 */
export function extractAccessToken(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;

  // { data: { accessToken } }
  if (root.data && typeof root.data === "object") {
    const data = root.data as Record<string, unknown>;
    if (typeof data.accessToken === "string" && data.accessToken) {
      return data.accessToken;
    }
    // { data: { data: { accessToken } } }
    if (data.data && typeof data.data === "object") {
      const nested = data.data as Record<string, unknown>;
      if (typeof nested.accessToken === "string" && nested.accessToken) {
        return nested.accessToken;
      }
    }
  }

  if (typeof root.accessToken === "string" && root.accessToken) {
    return root.accessToken;
  }

  return null;
}
