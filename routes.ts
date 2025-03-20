// routes.ts
export const DEFAULT_LOGIN_REDIRECT: string = "/protected/admin";
export const apiAuthPrefix = "/api/auth";
export const authRoutes = ["/auth/login", "/auth/register", "/auth/error", "/auth/reset", "/auth/new-password"];
export const publicRoutes = ["/", "/auth/new-verification"];