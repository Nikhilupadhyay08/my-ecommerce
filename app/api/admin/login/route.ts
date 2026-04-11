import { NextResponse } from "next/server";
import {
  adminPassword,
  createAdminSessionToken,
  safeEqualStrings,
} from "@/lib/adminSessionNode";

export async function POST(request: Request) {
  if (adminPassword().length === 0) {
    return NextResponse.json(
      {
        error:
          "Set ADMIN_PASSWORD in your environment (Vercel → Settings → Environment Variables). Optionally set ADMIN_SESSION_SECRET for a separate signing key.",
      },
      { status: 503 }
    );
  }
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!safeEqualStrings(password, adminPassword())) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = createAdminSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Session error" }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  const isProd = process.env.NODE_ENV === "production";
  res.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
