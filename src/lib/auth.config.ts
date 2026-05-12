import type { NextAuthConfig } from "next-auth";

// Lightweight config — no Prisma, no bcrypt, safe for Edge/middleware.
// Providers are intentionally empty here; they live in auth.ts (Node.js runtime only).
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      if (pathname.startsWith("/super-admin")) {
        if (!isLoggedIn) return false;
        const role = (auth?.user as any)?.role;
        if (role !== "SUPER_ADMIN") {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return true;
      }

      if (pathname.startsWith("/admin")) {
        return isLoggedIn;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.restaurantId = (user as any).restaurantId;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string;
        (session.user as any).role = token.role;
        (session.user as any).restaurantId = token.restaurantId ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
