import { timingSafeEqual } from "crypto";
import { parseSessionToken, signSessionToken } from "@/lib/sessionTokenNode";

export function createAdminSessionToken(): string | null {
  return signSessionToken(sessionSecret(), {});
}

export function sessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    ""
  );
}

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "";
}

export function safeEqualStrings(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "utf8");
    const bb = Buffer.from(b, "utf8");
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

export function verifyAdminSessionCookie(token: string | undefined): boolean {
  return parseSessionToken(token, sessionSecret()) != null;
}
