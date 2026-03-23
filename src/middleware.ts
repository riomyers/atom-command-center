import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/health"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static assets
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  // Check auth cookie
  const token = req.cookies.get("atom-session")?.value;
  const expected = process.env.DASHBOARD_TOKEN;

  // If no DASHBOARD_TOKEN is set, skip auth (local dev)
  if (!expected) {
    return NextResponse.next();
  }

  if (token !== expected) {
    // API routes get 401 JSON, page routes get redirected to login
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
