import { PrismaClient } from "@prisma/client";

declare global {
    var prisma: PrismaClient | undefined;
}

export const db =
    globalThis.prisma ??
    new PrismaClient({
        log: ["query", "info", "warn", "error"],
    });

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;

// Test the database connection on startup, but only in a Node.js environment
// Avoid running in Edge Runtime (e.g., Next.js middleware)
// In Edge Runtime, process.versions.node is undefined
const isNodeJs = typeof process !== "undefined" && process.versions && typeof process.versions.node === "string";
if (typeof window === "undefined" && isNodeJs) {
    (async () => {
        try {
            console.log("Testing database connection...");
            await db.$connect();
            console.log("Database connection successful");
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error("Failed to connect to the database:", {
                    message: error.message,
                    stack: error.stack,
                    cause: error.cause,
                });
            } else {
                console.error("Failed to connect to the database: Unknown error", error);
            }
            // Log the error but do not exit the process, as this is not supported in Edge Runtime
            console.error("Continuing without database connection. Some features may not work.");
        }
    })();
}