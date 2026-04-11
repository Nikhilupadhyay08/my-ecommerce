import { NextResponse } from "next/server";
import getMongoClient from "@/lib/mongodb";
import { verifyOtp } from "@/lib/otpUtils";
import { createUserSessionToken } from "@/lib/userSession";

export async function POST(request: Request) {
  let body: { email?: string; otp?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const otp = typeof body.otp === "string" ? body.otp.trim() : "";

  if (!email.includes("@") || !/^\d{6}$/.test(otp)) {
    return NextResponse.json(
      { error: "Valid email and 6-digit code required." },
      { status: 400 }
    );
  }

  try {
    const client = await getMongoClient();
    const db = client.db("myStore");
    const coll = db.collection("pending_registrations");

    const pending = await coll.findOne<{
      name: string;
      passwordHash: string;
      otpHash: string;
      expiresAt: Date;
    }>({
      _id: email,
      expiresAt: { $gt: new Date() },
    });

    if (!pending || typeof pending.passwordHash !== "string") {
      return NextResponse.json(
        {
          error:
            "No active verification for this email. Request a new code from the registration page.",
        },
        { status: 400 }
      );
    }

    const otpOk = await verifyOtp(otp, pending.otpHash);
    if (!otpOk) {
      return NextResponse.json({ error: "Invalid verification code." }, { status: 401 });
    }

    const existing = await db.collection("users").findOne({ email });
    if (existing) {
      await coll.deleteOne({ _id: email });
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const name =
      typeof pending.name === "string" && pending.name.trim().length >= 2
        ? pending.name.trim()
        : "Customer";

    const ins = await db.collection("users").insertOne({
      email,
      name,
      passwordHash: pending.passwordHash,
      createdAt: new Date(),
    });

    await coll.deleteOne({ _id: email });

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
  } catch (e) {
    console.error("verify-register", e);
    return NextResponse.json(
      { error: "Could not complete registration. Check database connection." },
      { status: 500 }
    );
  }
}
