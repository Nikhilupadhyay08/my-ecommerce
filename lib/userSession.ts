import { parseSessionToken, signSessionToken } from "@/lib/sessionTokenNode";

export function userSessionSecret(): string {
  return (
    process.env.USER_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    ""
  );
}

export function createUserSessionToken(
  userId: string,
  email: string,
  name: string
): string | null {
  return signSessionToken(userSessionSecret(), { sub: userId, email, name });
}

export type SessionUser = { id: string; email: string; name: string };

export function parseUserFromToken(
  token: string | undefined
): SessionUser | null {
  const secret = userSessionSecret();
  if (!secret) return null;
  const p = parseSessionToken(token, secret);
  if (!p) return null;
  const sub = p.sub;
  const email = p.email;
  const name = p.name;
  if (typeof sub !== "string" || typeof email !== "string") return null;
  return {
    id: sub,
    email,
    name: typeof name === "string" ? name : "",
  };
}
