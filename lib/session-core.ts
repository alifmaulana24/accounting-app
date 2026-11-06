/**
 * Low-level HMAC session utilities.
 *
 * This module has NO "server-only" guard intentionally so that it can be
 * imported from proxy.ts (which runs in the Node.js runtime but cannot always
 * use the `server-only` package marker).
 *
 * Do NOT import this file from client components.
 */

import { createHmac, timingSafeEqual, randomBytes } from "crypto";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const SESSION_COOKIE_NAME = "ledger_session";
/** 7 days in milliseconds */
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

const ALGORITHM = "sha256";
/** Separator between base64url payload and hex HMAC signature. */
const SEPARATOR = ".";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SessionPayload {
  userId: string;
  expiresAt: string; // ISO-8601
  nonce: string;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function encodePayload(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodePayload(encoded: string): SessionPayload | null {
  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Token creation & verification
// ---------------------------------------------------------------------------

/**
 * Creates a signed session token:
 *   <base64url(payload)>.<hmac-sha256-hex>
 */
export function createToken(userId: string, secret: string): string {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
  const nonce = randomBytes(16).toString("hex");
  const payload: SessionPayload = { userId, expiresAt, nonce };
  const encoded = encodePayload(payload);
  const signature = createHmac(ALGORITHM, secret).update(encoded).digest("hex");
  return `${encoded}${SEPARATOR}${signature}`;
}

/**
 * Verifies the HMAC signature and expiry of a session token.
 * Returns the payload on success or null on failure.
 */
export function verifyToken(
  token: string,
  secret: string
): SessionPayload | null {
  const parts = token.split(SEPARATOR);
  if (parts.length < 2) return null;

  const signature = parts[parts.length - 1];
  const encoded = parts.slice(0, parts.length - 1).join(SEPARATOR);

  // 1. HMAC check (constant-time)
  const expectedSig = createHmac(ALGORITHM, secret)
    .update(encoded)
    .digest("hex");
  try {
    if (
      !timingSafeEqual(
        Buffer.from(expectedSig, "hex"),
        Buffer.from(signature, "hex")
      )
    ) {
      return null;
    }
  } catch {
    return null;
  }

  // 2. Decode payload
  const payload = decodePayload(encoded);
  if (!payload) return null;

  // 3. Expiry check
  if (Date.now() > new Date(payload.expiresAt).getTime()) return null;

  return payload;
}

/**
 * Extracts and verifies a session from a raw Cookie header string.
 * Used in proxy.ts where next/headers cookies() is unavailable.
 */
export function getSessionFromCookieHeader(
  cookieHeader: string | null,
  secret: string
): SessionPayload | null {
  if (!cookieHeader || !secret) return null;

  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));

  if (!match) return null;

  const token = match.slice(SESSION_COOKIE_NAME.length + 1);
  if (!token) return null;

  return verifyToken(token, secret);
}

