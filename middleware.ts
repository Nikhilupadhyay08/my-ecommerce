import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminSessionTokenEdge } from "@/lib/adminSessionVerifyEdge";
import { parseSessionTokenEdge } from "@/lib/sessionTokenEdge";

function userSessionSecret(): string {
  return (
    process.env.USER_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    ""
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
      return NextResponse.next();
    }

    const adminSecret =
      process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
    if (!adminSecret) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const token = request.cookies.get("admin_session")?.value;
    const ok = await verifyAdminSessionTokenEdge(token, adminSecret);
    if (ok) {
      return NextResponse.next();
    }

    const login = new URL("/admin/login", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname === "/checkout" || pathname.startsWith("/checkout/")) {
    const secret = userSessionSecret();
    const payload = await parseSessionTokenEdge(
      request.cookies.get("user_session")?.value,
      secret
    );
    if (
      payload &&
      typeof payload.sub === "string" &&
      typeof payload.email === "string"
    ) {
      return NextResponse.next();
    }

    const login = new URL("/login", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/checkout",
    "/checkout/:path*",
  ],
};
