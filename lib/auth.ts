/**
 * Admin session auth.
 *
 * Deliberately small: one password, one signed cookie, no user table. It is
 * built on Web Crypto rather than node:crypto so the same verify path runs in
 * middleware (Edge runtime) and in route handlers (Node runtime).
 *
 * Required environment variables — if either is missing, the admin surface
 * fails closed and returns 503 rather than defaulting to open:
 *
 *   ADMIN_PASSWORD   the password you type at /admin/login
 *   AUTH_SECRET      random string used to sign the session cookie
 *
 * Generate a secret with:  openssl rand -base64 32
 */

export const SESSION_COOKIE = "rb_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
/** Minimum viable strength. Short secrets make the cookie signature guessable. */
const MIN_SECRET_LENGTH = 16;

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return toBase64Url(new Uint8Array(sig));
}

/**
 * Length-independent, content-constant-time comparison. Both sides are hashed
 * first so that differing lengths do not leak through the loop bound.
 */
async function safeEqual(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b)),
  ]);
  const va = new Uint8Array(ha);
  const vb = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < va.length; i++) diff |= va[i] ^ vb[i];
  return diff === 0;
}

type AdminConfig = { password: string; secret: string };

/**
 * Returns the admin credentials, or null when the admin surface is not
 * configured. Callers must treat null as "refuse", never as "allow".
 */
export function adminConfig(): AdminConfig | null {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.AUTH_SECRET;
  if (!password || !secret) return null;
  if (secret.length < MIN_SECRET_LENGTH) {
    console.error(
      `[auth] AUTH_SECRET is shorter than ${MIN_SECRET_LENGTH} characters; admin disabled.`,
    );
    return null;
  }
  return { password, secret };
}

export function adminConfigured(): boolean {
  return adminConfig() !== null;
}

/** Cookie value for a fresh session, plus the matching maxAge in seconds. */
export async function createSession(): Promise<{ value: string; maxAge: number } | null> {
  const config = adminConfig();
  if (!config) return null;

  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = String(expiresAt);
  const signature = await hmac(config.secret, payload);
  return { value: `${payload}.${signature}`, maxAge: Math.floor(SESSION_TTL_MS / 1000) };
}

/** True only for a correctly-signed, unexpired cookie. */
export async function verifySession(token: string | undefined | null): Promise<boolean> {
  const config = adminConfig();
  if (!config || !token) return false;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  const expected = await hmac(config.secret, payload);
  if (!(await safeEqual(signature, expected))) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && Date.now() < expiresAt;
}

export async function checkPassword(candidate: string): Promise<boolean> {
  const config = adminConfig();
  if (!config) return false;
  return safeEqual(candidate, config.password);
}

/** Cookie attributes shared by the set and clear paths. */
export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  // Secure in production; omitted in dev so the cookie works over plain http.
  secure: process.env.NODE_ENV === "production",
};
