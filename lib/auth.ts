/**
 * Credential validation — server-only.
 *
 * Credentials are defined here and never sent to the client.
 * Replace with a database lookup when users are added.
 */
import "server-only";

// ---------------------------------------------------------------------------
// Static credentials (single admin account)
// ---------------------------------------------------------------------------

const STATIC_USERNAME = "admin";
const STATIC_PASSWORD = "admin123";

/**
 * Returns the userId (username) if credentials match, otherwise null.
 * Comparison is done on the server; credentials are never exposed to JS bundles.
 */
export function validateCredentials(
  username: string,
  password: string
): string | null {
  const usernameMatch = username === STATIC_USERNAME;
  const passwordMatch = password === STATIC_PASSWORD;

  if (usernameMatch && passwordMatch) {
    return STATIC_USERNAME;
  }

  return null;
}

