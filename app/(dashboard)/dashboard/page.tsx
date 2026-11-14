import { DashboardPageClient } from "@/components/dashboard/dashboard-page-client";
import { getSession } from "@/lib/session";

export const instant = false;

export default async function DashboardPage() {
  await getSession();

  return <DashboardPageClient />;
}
