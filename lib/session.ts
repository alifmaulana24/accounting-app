/**
 * Server-side session helpers (Server Actions, RSC, Route Handlers).
 * Wraps session-core.ts and adds cookie management via next/headers.
 *
 * This module is server-only — it must never be imported by client bundles.
 */
import "server-only";

import { cookies } from "next/headers";
import { connection } from "next/server";
import {
  createToken,
  verifyToken,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_MS,
  type SessionPayload,
} from "./session-core";

export type { SessionPayload };
export { getSessionFromCookieHeader } from "./session-core";

// ---------------------------------------------------------------------------
// Secret key access
// ---------------------------------------------------------------------------

function requireSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET environment variable is not set. " +
        "Copy .env.example to .env.local and set a strong random value."
    );
  }
  return secret;
}

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------

/**
 * Creates a signed session cookie after a successful login.
 */
export async function createSession(userId: string): Promise<void> {
  const secret = requireSecret();
  const token = createToken(userId, secret);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

/**
 * Deletes the session cookie (logout).
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    expires: new Date(0),
    path: "/",
  });
}

/**
 * Reads and verifies the session from the incoming request cookies.
 * Returns the payload or null if the session is absent, invalid, or expired.
 */
export async function getSession(): Promise<SessionPayload | null> {
  await connection();
  const secret = requireSecret();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token, secret);
}
