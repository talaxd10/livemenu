import NextAuth from "next-auth";
import type { NextAuthConfig, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

type ExtendedUser = User & { role: string; restaurantId: string | null };

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[auth] authorize() called", { email: credentials?.email });
        if (!credentials?.email || !credentials?.password) {
          console.log("[auth] authorize: missing credentials");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        console.log("[auth] authorize: user found?", !!user, "has hash?", !!user?.passwordHash);
        if (!user?.passwordHash) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        console.log("[auth] authorize: password valid?", isValid);
        if (!isValid) return null;

        console.log("[auth] authorize: success for", user.email, "role:", user.role);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          restaurantId: user.restaurantId,
        } as ExtendedUser;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const u = user as ExtendedUser;
        token.role = u.role;
        token.restaurantId = u.restaurantId;
        console.log("[auth] jwt callback: user signed in, role:", u.role);
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
        session.user.restaurantId =
          (token.restaurantId as string | null) ?? null;
        console.log("[auth] session callback: token.sub", token.sub, "role:", token.role);
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
