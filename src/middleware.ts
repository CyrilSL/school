import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "~/env";
import type { Session } from "~/server/auth";

const authRoutes = ["/signup", "/signup/parent", "/signup/institution", "/login/parent", "/login/institution", "/admin/signin"];
const passwordRoutes = ["/reset-password", "/forgot-password"];
const protectedAdminRoutes = ["/admin/dashboard", "/admin/institutions"];
const protectedInstitutionRoutes = ["/institution/dashboard"];
const protectedParentRoutes = ["/parent/dashboard"];
// const noAuthRoutes = ["/test"];

export default async function authMiddleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname;

  const isAuthRoute = authRoutes.includes(pathName);
  const isPasswordRoute = passwordRoutes.includes(pathName);
  const isProtectedAdminRoute = protectedAdminRoutes.some(route => pathName.startsWith(route));
  const isProtectedInstitutionRoute = protectedInstitutionRoutes.some(route => pathName.startsWith(route));
  const isProtectedParentRoute = protectedParentRoutes.some(route => pathName.startsWith(route));
  const isAdminBaseRoute = pathName === "/admin";
  // const isOnlyProtectedRoutes = onlyProtectedRoutes.includes(pathName);
  // const isNoAuthRoute = noAuthRoutes.includes(pathName);

  // if (isNoAuthRoute) {
  //   return NextResponse.next();
  // }

  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: env.BETTER_AUTH_URL,
      headers: {
        //get the cookie from the request
        cookie: request.headers.get("cookie") ?? "",
      },
    },
  );


  if (!session) {
    // Allow access to auth routes, password routes
    if (isAuthRoute || isPasswordRoute) {
      return NextResponse.next();
    }

    // For /admin base route, let the page component handle redirect to /admin/signin
    if (isAdminBaseRoute) {
      return NextResponse.next();
    }

    // Block access to protected admin routes
    if (isProtectedAdminRoute) {
      return NextResponse.redirect(new URL("/admin/signin", request.url));
    }

    // Block access to protected institution routes
    if (isProtectedInstitutionRoute) {
      return NextResponse.redirect(new URL("/login/institution", request.url));
    }

    // Block access to protected parent routes
    if (isProtectedParentRoute) {
      return NextResponse.redirect(new URL("/login/parent", request.url));
    }

    return NextResponse.redirect(new URL("/", request.url));
  }

  // If logged in, redirect away from auth/password routes to appropriate dashboard
  if (isAuthRoute || isPasswordRoute) {
    if (session.user.role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else {
      // Check if user has organization membership for institution dashboard
      try {
        const { data: activeMember } = await betterFetch(
          "/api/auth/organization/get-active-member",
          {
            baseURL: env.BETTER_AUTH_URL,
            headers: {
              cookie: request.headers.get("cookie") ?? "",
            },
          },
        );

        if (activeMember) {
          return NextResponse.redirect(new URL("/institution/dashboard", request.url));
        }
      } catch (error) {
        // Fall through to parent dashboard
      }

      return NextResponse.redirect(new URL("/parent/dashboard", request.url));
    }
  }

  // Check admin access for protected admin routes and base admin route
  if ((isProtectedAdminRoute || isAdminBaseRoute) && session.user.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Check organization membership for institution routes
  if (isProtectedInstitutionRoute) {
    try {
      // Check if user has organization membership using better-auth API
      const { data: activeMember } = await betterFetch(
        "/api/auth/organization/get-active-member",
        {
          baseURL: env.BETTER_AUTH_URL,
          headers: {
            cookie: request.headers.get("cookie") ?? "",
          },
        },
      );

      if (!activeMember) {
        return NextResponse.redirect(new URL("/parent/dashboard", request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/parent/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|$).*)",
  ],
};
