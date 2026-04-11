import { createHmac, timingSafeEqual } from "crypto";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function signSessionToken(
  secret: string,
  claims: Record<string, unknown> = {}
): string | null {
  if (!secret) return null;
  const exp = Date.now() + WEEK_MS;
  const payload = JSON.stringify({ ...claims, exp, v: 1 });
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(payload, "utf8").toString("base64url") + "." + sig;
}

export function parseSessionToken(
  token: string | undefined,
  secret: string
): Record<string, unknown> | null {
  if (!token || !secret) return null;
  const dot = token.indexOf(".");
  if (dot < 1) return null;
  const payloadB64 = token.slice(0, dot);
  const sigHex = token.slice(dot + 1);
  if (!/^[0-9a-f]+$/i.test(sigHex) || sigHex.length % 2 !== 0) return null;

  let payload: string;
  try {
    payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return null;
  }

  const expectedSig = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  if (sigHex.length !== expectedSig.length) return null;
  try {
    if (
      !timingSafeEqual(Buffer.from(sigHex, "utf8"), Buffer.from(expectedSig, "utf8"))
    ) {
      return null;
    }
  } catch {
    return null;
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return null;
  }
  const exp = data.exp;
  if (typeof exp !== "number" || Date.now() >= exp) return null;
  return data;
}
