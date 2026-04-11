/**
 * Edge / middleware: verify HMAC token created by `createAdminSessionToken` in Node.
 */

function base64UrlToBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 2 ? "==" : s.length % 4 === 3 ? "=" : "";
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function hexToBytes(hex: string): Uint8Array {
  const len = hex.length / 2;
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export async function verifyAdminSessionTokenEdge(
  token: string | undefined,
  secret: string
): Promise<boolean> {
  if (!token || !secret) return false;
  const dot = token.indexOf(".");
  if (dot < 1) return false;
  const payloadB64 = token.slice(0, dot);
  const sigHex = token.slice(dot + 1);
  if (!/^[0-9a-f]+$/i.test(sigHex) || sigHex.length % 2 !== 0) return false;

  let payload: string;
  try {
    payload = new TextDecoder().decode(base64UrlToBytes(payloadB64));
  } catch {
    return false;
  }

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  let ok: boolean;
  try {
    ok = await crypto.subtle.verify(
      "HMAC",
      key,
      hexToBytes(sigHex),
      enc.encode(payload)
    );
  } catch {
    return false;
  }
  if (!ok) return false;

  try {
    const data = JSON.parse(payload) as { exp?: number; v?: number };
    return typeof data.exp === "number" && Date.now() < data.exp;
  } catch {
    return false;
  }
}
