import NextAuth, { Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import authConfig from "./auth.config";
import { getUserById } from "./data/user";
import { getAccountByUserId } from "./data/account";
import { UserRole } from "@prisma/client";
import { getTwoFactorConfirmationByUserId } from "./data/two-factor-confirmation";

// Debug log to verify environment variables
console.log("Environment Variables at Startup:", {
  AUTH_SECRET: process.env.AUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
});

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  unstable_update,
} = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      if (!user.id) throw new Error("User ID is undefined");

      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  callbacks: {
    async signIn({ user, account, credentials }) {
      console.log("SignIn callback (auth.ts) - User:", user, "Account:", account, "Credentials:", credentials);

      if (account?.provider !== "credentials") {
        console.log("Non-credentials provider, allowing sign-in");
        return true;
      }

      if (!user.id) {
        console.log("User ID is undefined");
        throw new Error("User ID is undefined");
      }

      const existingUser = await getUserById(user.id);
      console.log("Existing user:", existingUser);
      if (!existingUser || !existingUser.emailVerified) {
        console.log("User not found or email not verified");
        return false;
      }

      if (existingUser.isTwoFactorEnabled) {
        // Let the Credentials provider's authorize function handle 2FA verification
        console.log("2FA enabled, relying on Credentials provider's authorize function");
        return true;
      }

      console.log("No 2FA enabled, allowing sign-in");
      return true;
    },

    async jwt({ token }) {
      console.log("JWT callback (auth.ts) - Token before update:", token);
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);
      if (!existingUser) return token;

      const existingAccount = await getAccountByUserId(existingUser.id);

      // Determine if the user is an OAuth user
      const isOAuth = !!existingAccount || !existingUser.password;
      token.isOAuth = isOAuth;

      // Log a warning if the user's state is inconsistent
      if (!existingAccount && !existingUser.password) {
        console.warn(
          "User data inconsistency detected: User has neither an Account nor a password set.",
          { userId: existingUser.id, email: existingUser.email }
        );
      }

      token.name = existingUser.name ?? "";
      token.email = existingUser.email ?? "";
      token.role = existingUser.role;
      token.isTwoFactorEnabled = Boolean(existingUser.isTwoFactorEnabled);

      console.log("JWT callback (auth.ts) - Token after update:", token);
      return token;
    },

    async session({ session, token }) {
      console.log("Session callback (auth.ts) - Session before update:", session, "Token:", token, "User ID:", token.sub);
      if (token && session.user) {
        session.user.id = token.sub ?? session.user.id;
        session.user.role = (token.role as UserRole) ?? session.user.role;
        session.user.isTwoFactorEnabled = Boolean(token.isTwoFactorEnabled);
        session.user.name = token.name ?? "";
        session.user.email = token.email ?? "";
        session.user.isOAuth = token.isOAuth as boolean;
        session.user.image = token.picture || undefined;
      } else {
        console.log("Session callback (auth.ts) - No token or session.user provided");
      }
      console.log("Session callback (auth.ts) - Session after update:", session);
      return session;
    },
  },
  adapter: PrismaAdapter(db) as any,
  session: { strategy: "jwt" },
  debug: true,
  ...authConfig,
});