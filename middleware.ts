import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, adminConfigured, verifySession } from "@/lib/auth";

/**
 * Gate for everything under /admin and /api/admin.
 *
 * This is the single choke point: route handlers still re-check the session,
 * but nothing reaches them unauthenticated. The login endpoint and login page
 * are the only exceptions.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";
  const isApi = pathname.startsWith("/api/admin");

  if (isLoginApi) return NextResponse.next();

  // Fail closed when ADMIN_PASSWORD / AUTH_SECRET are not set.
  if (!adminConfigured()) {
    if (isApi) {
      return NextResponse.json(
        { error: "Admin is not configured. Set ADMIN_PASSWORD and AUTH_SECRET." },
        { status: 503 },
      );
    }
    if (!isLoginPage) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  const authed = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  if (isLoginPage) {
    // Already signed in — no reason to show the form again.
    return authed ? NextResponse.redirect(new URL("/admin", request.url)) : NextResponse.next();
  }

  if (authed) return NextResponse.next();

  if (isApi) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  if (pathname !== "/admin") loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
