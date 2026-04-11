import { NextResponse } from "next/server";
import getMongoClient from "@/lib/mongodb";
import { hashPassword } from "@/lib/password";
import { sendMailWithSettings } from "@/lib/mailer";
import { getSmtpSettings } from "@/lib/siteSettings";
import { generateRegisterOtp, hashOtp } from "@/lib/otpUtils";

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

export async function POST(request: Request) {
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (name.length < 2 || !email.includes("@") || password.length < 6) {
    return NextResponse.json(
      { error: "Valid name, email, and password (6+ chars) required." },
      { status: 400 }
    );
  }

  const smtp = await getSmtpSettings();
  if (!smtp?.host || !smtp.from) {
    return NextResponse.json(
      {
        error:
          "Email is not configured. Ask the store admin to set SMTP under Admin → Email / SMTP.",
      },
      { status: 503 }
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

    const coll = db.collection("pending_registrations");
    const existingPending = await coll.findOne<{ lastSentAt?: Date }>({
      _id: email,
    });
    if (existingPending?.lastSentAt) {
      const elapsed = Date.now() - new Date(existingPending.lastSentAt).getTime();
      if (elapsed < RESEND_COOLDOWN_MS) {
        const waitSec = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
        return NextResponse.json(
          { error: `Please wait ${waitSec}s before requesting another code.` },
          { status: 429 }
        );
      }
    }

    const otpPlain = generateRegisterOtp();
    const [otpHash, passwordHash] = await Promise.all([
      hashOtp(otpPlain),
      hashPassword(password),
    ]);

    const now = new Date();
    await coll.replaceOne(
      { _id: email },
      {
        _id: email,
        email,
        name,
        passwordHash,
        otpHash,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
        lastSentAt: now,
        createdAt: existingPending?.createdAt ?? now,
      },
      { upsert: true }
    );

    try {
      await sendMailWithSettings(smtp, {
        to: email,
        subject: "Your Nikhil Store verification code",
        html: `
        <p style="font-family:sans-serif;font-size:16px">Hi ${escapeHtml(name)},</p>
        <p style="font-family:sans-serif;font-size:16px">Use this code to finish creating your account:</p>
        <p style="font-family:sans-serif;font-size:28px;font-weight:bold;letter-spacing:4px">${otpPlain}</p>
        <p style="font-family:sans-serif;font-size:14px;color:#666">This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>
      `,
      });
    } catch (mailErr) {
      await coll.deleteOne({ _id: email }).catch(() => {});
      throw mailErr;
    }

    return NextResponse.json({ ok: true, email });
  } catch (e) {
    console.error("send-register-otp", e);
    return NextResponse.json(
      { error: "Could not send verification email. Check SMTP settings." },
      { status: 500 }
    );
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
