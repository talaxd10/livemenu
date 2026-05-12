import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /admin and /super-admin routes
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/super-admin")) {
    return NextResponse.next();
  }

  // Auth.js v5 uses "authjs.session-token" (dev) or "__Secure-authjs.session-token" (prod)
  // getToken from next-auth/jwt defaults to the v4 name, so we must specify it explicitly.
  const isProduction = process.env.NODE_ENV === "production";
  const cookieName = isProduction
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    cookieName,
    secureCookie: isProduction,
  });

  console.log("[middleware]", { pathname, cookieName, hasToken: !!token, env: process.env.NODE_ENV });

  const isLoggedIn = !!token;
  const role = token?.role as string | undefined;

  if (pathname.startsWith("/super-admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/api")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/super-admin/:path*"],
};
