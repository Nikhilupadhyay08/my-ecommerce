import { NextResponse } from "next/server";
import getMongoClient from "@/lib/mongodb";
import { hashPassword } from "@/lib/password";
import { createUserSessionToken } from "@/lib/userSession";

export async function POST(request: Request) {
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const emailRaw = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const email = emailRaw.toLowerCase();

  if (name.length < 2 || !email.includes("@") || password.length < 6) {
    return NextResponse.json(
      { error: "Valid name, email, and password (6+ chars) required." },
      { status: 400 }
    );
  }

  try {
    const client = await getMongoClient();
    const db = client.db("myStore");
    const existing = await db.collection("users").findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const ins = await db.collection("users").insertOne({
      email,
      name,
      passwordHash,
      createdAt: new Date(),
    });

    const userId = ins.insertedId.toString();
    const token = createUserSessionToken(userId, email, name);
    if (!token) {
      return NextResponse.json(
        { error: "Server session not configured." },
        { status: 503 }
      );
    }

    const res = NextResponse.json({ ok: true, user: { id: userId, email, name } });
    res.cookies.set("user_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json(
      { error: "Could not create account. Check database connection." },
      { status: 500 }
    );
  }
}
