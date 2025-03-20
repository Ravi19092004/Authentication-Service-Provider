// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./auth";
import { apiAuthPrefix, authRoutes, DEFAULT_LOGIN_REDIRECT, publicRoutes } from "./routes";

export default async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const session = await auth();
  const isLoggedIn = !!session?.user;

  console.log("Middleware - isLoggedIn:", isLoggedIn, "Session:", session);
  console.log("Middleware - pathname:", nextUrl.pathname);

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    console.log("Middleware - Allowing API auth route:", nextUrl.pathname);
    return NextResponse.next();
  }

  if (isAuthRoute) {
    console.log("Middleware - Allowing auth route:", nextUrl.pathname);
    if (isLoggedIn) {
      console.log("Middleware - User is logged in, redirecting to:", DEFAULT_LOGIN_REDIRECT);
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublicRoute) {
    console.log("Middleware - User not logged in, redirecting to /auth/login");
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  console.log("Middleware - Allowing route:", nextUrl.pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};