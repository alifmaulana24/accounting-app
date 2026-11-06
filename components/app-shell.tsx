import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

interface AppShellProps {
  children: React.ReactNode;
  pageTitle: string;
  userId: string;
}

/**
 * AppShell — the main layout wrapper for all authenticated pages.
 * Combines SidebarProvider, AppSidebar, SidebarInset, AppHeader, and content.
 */
export function AppShell({ children, pageTitle, userId }: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader pageTitle={pageTitle} userId={userId} />
        <div className="flex flex-1 flex-col gap-6 p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

