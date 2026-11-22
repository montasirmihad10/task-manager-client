"use client";

import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "./token";

/** @deprecated prefer getAccessToken */
export function getClientToken(): string | null {
  return getAccessToken();
}

/** @deprecated prefer setAccessToken */
export function setClientToken(token: string): void {
  setAccessToken(token);
}

/** @deprecated prefer clearAccessToken */
export function clearClientToken(): void {
  clearAccessToken();
}
