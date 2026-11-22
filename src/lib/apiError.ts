/** Pull a human message from RTK/axios error or success-shaped responses. */
export function apiErrorMessage(
  result: { error?: unknown; data?: unknown } | unknown,
  fallback = "Something went wrong",
): string {
  if (!result || typeof result !== "object") return fallback;

  const r = result as {
    error?: {
      data?: unknown;
      status?: number;
    };
    data?: { message?: string; success?: boolean };
  };

  if (r.error) {
    const data = r.error.data;
    if (typeof data === "string" && data.trim()) return data;
    if (data && typeof data === "object") {
      const msg = (data as { message?: string }).message;
      if (msg) return msg;
    }
    return fallback;
  }

  if (r.data && typeof r.data === "object" && r.data.message && !r.data.success) {
    return r.data.message;
  }

  return fallback;
}

export function isApiSuccess(result: {
  data?: { success?: boolean; data?: unknown };
  error?: unknown;
}): boolean {
  if (result?.error) return false;
  return Boolean(result?.data?.success || result?.data?.data);
}
