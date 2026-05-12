import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Use the lightweight auth config (no Prisma/bcrypt) to stay within Edge size limits.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/admin/:path*", "/super-admin/:path*"],
};
