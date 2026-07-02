import "server-only";

/**
 * Admin impersonation is carried in a signed, http-only cookie holding the
 * target user's id. The admin's own Supabase session stays intact underneath;
 * data access is re-scoped to the impersonated user via the service-role
 * client. A persistent banner lets the admin exit at any time.
 */
export const IMPERSONATION_COOKIE = "resonance_imp";

const encoder = new TextEncoder();

async function hmacKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(process.env.IMPERSONATION_SECRET ?? "dev-insecure-secret"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

export async function signImpersonation(userId: string): Promise<string> {
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(), encoder.encode(userId));
  return `${userId}.${Buffer.from(sig).toString("base64url")}`;
}

export async function verifyImpersonation(value: string): Promise<string | null> {
  const dot = value.lastIndexOf(".");
  if (dot < 0) return null;
  const userId = value.slice(0, dot);
  const provided = Buffer.from(value.slice(dot + 1), "base64url");
  const expected = Buffer.from(
    await crypto.subtle.sign("HMAC", await hmacKey(), encoder.encode(userId)),
  );
  if (provided.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= provided[i] ^ expected[i];
  return diff === 0 ? userId : null;
}
