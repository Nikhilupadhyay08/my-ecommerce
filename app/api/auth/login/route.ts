import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import getMongoClient from "@/lib/mongodb";
import { verifyPassword } from "@/lib/password";
import { createUserSessionToken } from "@/lib/userSession";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required." }, { status: 400 });
  }

  try {
    const client = await getMongoClient();
    const db = client.db("myStore");
    const user = await db.collection("users").findOne({ email });
    if (!user || typeof user.passwordHash !== "string") {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const userId =
      user._id instanceof ObjectId ? user._id.toString() : String(user._id);
    const name = typeof user.name === "string" ? user.name : "";
    const token = createUserSessionToken(userId, email, name);
    if (!token) {
      return NextResponse.json(
        { error: "Server session not configured." },
        { status: 503 }
      );
    }

    const res = NextResponse.json({
      ok: true,
      user: { id: userId, email, name },
    });
    res.cookies.set("user_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
