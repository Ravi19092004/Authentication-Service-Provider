import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig, User } from "next-auth";
import { LoginSchema } from "@/src/schemas";
import { getUserByEmail } from "@/data/user";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { UserRole } from "@prisma/client";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials, request): Promise<User | null> {
        console.log("Authorize function called with credentials:", credentials);

        const validatedFields = LoginSchema.safeParse(credentials);
        if (!validatedFields.success) {
          console.log("Validation failed:", validatedFields.error);
          return null;
        }

        const { email, password } = validatedFields.data;
        console.log("Authorizing user with email:", email, "Password provided:", password);

        const user = await getUserByEmail(email);
        if (!user || !user.email) {
          console.log("User not found for email:", email);
          return null;
        }

        console.log("User found:", user.id, "2FA enabled:", user.isTwoFactorEnabled);

        // Handle the case where password is undefined or the string 'undefined'
        if (password === undefined || password === "undefined") {
          console.log("No password provided, checking 2FA confirmation...");
          if (user.isTwoFactorEnabled) {
            const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(user.id);
            console.log("2FA confirmation check result:", twoFactorConfirmation);
            if (!twoFactorConfirmation) {
              console.log("No 2FA confirmation found for user:", email);
              return null;
            }
            console.log("2FA verified, proceeding with authentication for user:", email);
          } else {
            console.log("No password provided and 2FA not enabled for user:", email);
            return null;
          }
        } else {
          // If password is provided, verify it
          console.log("Password provided, verifying...");
          if (!user.password) {
            console.log("No password set for user:", email);
            return null;
          }
          const passwordsMatch = await bcrypt.compare(password, user.password);
          console.log("Password match:", passwordsMatch, "Provided:", password, "Hashed:", user.password);
          if (!passwordsMatch) {
            console.log("Password verification failed for user:", email);
            return null;
          }
        }

        console.log("User authenticated successfully:", user.id);
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role as UserRole,
          isTwoFactorEnabled: user.isTwoFactorEnabled,
          isOAuth: !user.password, // Add isOAuth here
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT callback - User:", user, "Token before update:", token);
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isTwoFactorEnabled = user.isTwoFactorEnabled;
        token.isOAuth = user.isOAuth; // Add isOAuth to token
      }
      console.log("Token after update:", token);
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback (auth.config) - Session before update:", session, "Token:", token);
      if (token.id) {
        session.user.id = token.id as string;
      }
      if (token.role) {
        session.user.role = token.role as UserRole;
      }
      if (token.isTwoFactorEnabled !== undefined) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
      }
      if (token.isOAuth !== undefined) {
        session.user.isOAuth = token.isOAuth as boolean; // Add isOAuth to session
      }
      console.log("Session callback (auth.config) - Session after update:", session);
      return session;
    },
    async signIn({ user, account, profile }) {
      console.log("SignIn callback - User:", user, "Account:", account, "Profile:", profile);
      if (account?.provider === "google" || account?.provider === "github") {
        const email = profile?.email;
        if (!email) return false;

        let dbUser = await getUserByEmail(email);
        if (!dbUser) {
          dbUser = await db.user.create({
            data: {
              email,
              name: profile?.name || "",
              image: profile?.image || profile?.picture || "",
              role: "USER",
              isTwoFactorEnabled: false,
            },
          });
        }

        user.id = dbUser.id;
        user.role = dbUser.role as UserRole;
        user.isTwoFactorEnabled = dbUser.isTwoFactorEnabled;
        user.isOAuth = !dbUser.password;
      }
      return true;
    },
  },
};

export default authConfig;