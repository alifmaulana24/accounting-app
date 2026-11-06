import { redirect } from "next/navigation";

/**
 * Root page — immediately redirects to /login.
 * The proxy (proxy.ts) will further redirect authenticated users to /dashboard.
 */
export default function RootPage() {
  redirect("/login");
}
