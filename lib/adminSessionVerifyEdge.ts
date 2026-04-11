import { parseSessionTokenEdge } from "@/lib/sessionTokenEdge";

export async function verifyAdminSessionTokenEdge(
  token: string | undefined,
  secret: string
): Promise<boolean> {
  const p = await parseSessionTokenEdge(token, secret);
  return p != null;
}
