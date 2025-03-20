import { db } from "../lib/db";
import { UserRole } from "@prisma/client";

interface AuthUser {
    id: string;
    name?: string | null;
    email?: string | null;
    password?: string | null;
    role: UserRole;
    emailVerified?: Date | null;
    isTwoFactorEnabled: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export const getUserByEmail = async (email: string | null | undefined): Promise<AuthUser | null> => {
    console.log("Fetching user by email:", email);
    if (!email || typeof email !== "string") {
        console.log("Email is null, undefined, or not a string, returning null");
        return null;
    }

    try {
        const user = await db.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                role: true,
                emailVerified: true,
                isTwoFactorEnabled: true,
                image: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        console.log("User fetched:", user ? user.id : "No user found");
        return user;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Failed to fetch user by email:", {
                message: error.message,
                stack: error.stack,
                cause: error.cause,
            });
        } else {
            console.error("Failed to fetch user by email: Unknown error", error);
        }
        throw new Error("Failed to fetch user by email");
    }
};

export const getUserById = async (id: string): Promise<AuthUser | null> => {
    console.log("Fetching user by ID:", id);
    try {
        const user = await db.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true, // Added email field
                password: true, // Added password field
                role: true,
                emailVerified: true,
                isTwoFactorEnabled: true,
                image: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            console.log("User not found for ID:", id);
            return null; // Return null instead of throwing an error
        }
        console.log("User fetched by ID:", user.id);
        return user;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Failed to fetch user by ID:", {
                message: error.message,
                stack: error.stack,
                cause: error.cause,
            });
        } else {
            console.error("Failed to fetch user by ID: Unknown error", error);
        }
        throw new Error("Failed to fetch user by ID");
    }
};