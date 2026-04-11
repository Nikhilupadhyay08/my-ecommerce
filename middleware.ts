import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminSessionTokenEdge } from "@/lib/adminSessionVerifyEdge";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return NextResponse.next();
  }

  const secret =
    process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
  if (!secret) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const token = request.cookies.get("admin_session")?.value;
  const ok = await verifyAdminSessionTokenEdge(token, secret);
  if (ok) {
    return NextResponse.next();
  }

  const login = new URL("/admin/login", request.url);
  login.searchParams.set("from", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
