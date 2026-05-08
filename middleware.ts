import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  if (
    nextUrl.pathname.startsWith("/admin") &&
    !nextUrl.pathname.startsWith("/admin/api")
  ) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (nextUrl.pathname.startsWith("/super-admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  if (nextUrl.pathname === "/login" && isLoggedIn) {
    if (role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/super-admin", req.url));
    }
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)"],
};
