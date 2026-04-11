import { cookies } from "next/headers";
import { verifyAdminSessionCookie } from "@/lib/adminSessionNode";
import { parseUserFromToken } from "@/lib/userSession";

export async function requireAdminSession(): Promise<boolean> {
  const jar = await cookies();
  return verifyAdminSessionCookie(jar.get("admin_session")?.value);
}

export async function getSessionUserFromCookies() {
  const jar = await cookies();
  return parseUserFromToken(jar.get("user_session")?.value);
}
