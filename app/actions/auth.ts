"use server";

import { redirect } from "next/navigation";
import { validateCredentials } from "@/lib/auth";
import { createSession, deleteSession } from "@/lib/session";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LoginState =
  | { error: string }
  | { error: null }
  | undefined;

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

/**
 * Validates credentials and creates a session on success.
 * Called by the login form via useActionState.
 */
export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = (formData.get("username") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (!username || !password) {
    return { error: "Username dan password wajib diisi." };
  }

  const userId = validateCredentials(username, password);

  if (!userId) {
    return { error: "Username atau password salah." };
  }

  await createSession(userId);

  redirect("/dashboard");
}

/**
 * Destroys the session and redirects to the login page.
 * Called by the logout button.
 */
export async function logoutAction(): Promise<never> {
  await deleteSession();
  redirect("/login");
}

