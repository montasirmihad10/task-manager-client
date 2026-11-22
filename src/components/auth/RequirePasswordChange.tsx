"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useGetMyProfileQuery } from "@/redux/api/authApi";
import { getClientToken } from "@/lib/auth/cookies.client";

/** Keeps users with mustChangePassword out of the dashboard until they update it. */
export function RequirePasswordChange({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(Boolean(getClientToken()));
  }, [pathname]);

  const { data, isFetching } = useGetMyProfileQuery(undefined, {
    skip: !hasToken,
  });
  const mustChange = Boolean(
    (data?.data as { mustChangePassword?: boolean } | undefined)
      ?.mustChangePassword,
  );

  useEffect(() => {
    if (!hasToken || isFetching) return;
    if (mustChange && !pathname.includes("/change-password")) {
      router.replace("/change-password");
    }
  }, [hasToken, isFetching, mustChange, pathname, router]);

  if (hasToken && mustChange) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4 text-sm text-muted">
        Redirecting to change password…
      </div>
    );
  }

  return <>{children}</>;
}
