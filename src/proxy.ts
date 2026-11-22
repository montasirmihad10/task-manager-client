import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_CONFIG } from "@/lib/auth/auth.config";

/**
 * Next.js 16 request proxy (formerly middleware).
 * Cookie gate for authenticated app areas. API auth remains JWT on the backend.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_CONFIG.TOKEN_COOKIE_KEY)?.value;
  const { pathname } = request.nextUrl;

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/user") ||
    pathname === "/change-password" ||
    pathname.startsWith("/change-password/");

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // Already signed in — skip auth screens unless a redirect target is set
  // (invite / deep-link flows need /login?redirect=...)
  const isAuthScreen =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/signup" ||
    pathname === "/forgot-password";

  if (
    token &&
    isAuthScreen &&
    !request.nextUrl.searchParams.get("redirect")
  ) {
    return NextResponse.redirect(new URL("/dashboard/overview", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/user/:path*",
    "/change-password",
    "/change-password/:path*",
    "/login",
    "/register",
    "/signup",
    "/forgot-password",
  ],
};
