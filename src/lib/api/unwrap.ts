/**
 * Axios interceptor + RTK returns result.data = { success, message, data, meta }.
 * Use these helpers to reach the actual payload.
 */
export function unwrapData<T = unknown>(result: unknown): T | undefined {
  if (!result || typeof result !== "object") return undefined;
  const outer = result as { data?: unknown };
  if (!outer.data || typeof outer.data !== "object") return undefined;
  const body = outer.data as { data?: T; success?: boolean };
  return body.data;
}

export function unwrapSuccess(result: unknown): boolean {
  if (!result || typeof result !== "object") return false;
  const outer = result as { data?: { success?: boolean } };
  return Boolean(outer.data?.success);
}
