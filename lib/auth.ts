// lib/auth.ts
import { auth } from "@/auth";
import { Session } from "next-auth";

export const currentUser = async (): Promise<Session["user"] | undefined> => {
    const session = await auth();
    return session?.user;
};

export const currentRole = async (): Promise<string | undefined> => {
    const session = await auth();
    return session?.user?.role;
};