import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";

export const instant = false;

/**
 * Protected layout for the (dashboard) route group.
 *
 * - Verifies the session on every render (authoritative server-side auth gate).
 * - Wraps all protected pages in the AppShell (sidebar + header).
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <AppShell pageTitle="Dashboard" userId={session.userId}>
      {children}
    </AppShell>
  );
}
