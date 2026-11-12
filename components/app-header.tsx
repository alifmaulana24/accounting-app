"use client";

import { useTransition } from "react";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { LogOut, User } from "lucide-react";

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/produk": "Produk",
  "/pelanggan": "Pelanggan",
  "/pemasok": "Pemasok",
  "/pembelian": "Pembelian",
  "/penjualan": "Penjualan",
  "/inventory": "Inventory",
  "/daftar-akun": "Daftar Akun",
  "/jurnal-umum": "Jurnal Umum",
  "/buku-besar": "Buku Besar",
};

interface AppHeaderProps {
  pageTitle: string;
  userId: string;
}

export function AppHeader({ pageTitle, userId }: AppHeaderProps) {
  const pathname = usePathname();
  const currentTitle = routeTitles[pathname] ?? pageTitle;
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
      {/* Sidebar toggle */}
      <SidebarTrigger className="-ml-1" />

      <Separator orientation="vertical" className="mx-1 h-4" />

      {/* Breadcrumb / page title */}
      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="text-sm font-medium">
              {currentTitle}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* User avatar + dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold uppercase shrink-0">
            {userId.charAt(0)}
          </span>
          <span className="hidden text-sm font-medium text-foreground sm:inline">
            {userId}
          </span>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex items-center gap-2 font-normal">
              <User className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{userId}</span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer"
            onClick={handleLogout}
            disabled={isPending}
          >
            <LogOut className="size-4" />
            <span>{isPending ? "Keluar..." : "Logout"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
