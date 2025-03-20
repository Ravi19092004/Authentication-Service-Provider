// next-auth.d.ts
import { UserRole } from "@prisma/client";
import NextAuth, { DefaultSession, Session } from "next-auth";
import { NextRequest } from "next/server";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role?: UserRole;
            isTwoFactorEnabled: boolean;
            isOAuth: boolean;
        } & DefaultSession["user"];
    }
    
    interface User {  
        id: string;
        email?: string;
        password?: string;
        role?: UserRole;
        isTwoFactorEnabled: boolean;
        isOAuth?: boolean; // Add this if not already present
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string; // Add id
        role?: UserRole;
        sub?: string;
        isTwoFactorEnabled?: boolean;
        isOAuth?: boolean; // Add this
    }
}

declare module "@auth/core/adapters" {
    interface AdapterUser extends DefaultSession["user"] {
        role?: UserRole;
        isTwoFactorEnabled?: boolean;
    }
}

declare module "next/server" {
    interface NextRequest {
        auth?: Session | null;
    }
}