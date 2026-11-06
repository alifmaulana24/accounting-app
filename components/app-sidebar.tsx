"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  ShoppingCart,
  TrendingUp,
  Warehouse,
  CreditCard,
  Banknote,
  BookOpen,
  FileText,
  BookMarked,
  Scale,
  PieChart,
  BarChart3,
} from "lucide-react";

import { LogoutButton } from "@/components/logout-button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

// ---------------------------------------------------------------------------
// Navigation definition
// ---------------------------------------------------------------------------

const navGroups = [
  {
    label: "Menu Utama",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Master Data",
    items: [
      { title: "Produk", href: "/produk", icon: Package },
      { title: "Pelanggan", href: "/pelanggan", icon: Users },
      { title: "Pemasok", href: "/pemasok", icon: Truck },
    ],
  },
  {
    label: "Transaksi",
    items: [
      { title: "Pembelian", href: "/pembelian", icon: ShoppingCart },
      { title: "Penjualan", href: "/penjualan", icon: TrendingUp },
      { title: "Inventory", href: "/inventory", icon: Warehouse },
    ],
  },
  {
    label: "Pembayaran",
    items: [
      { title: "Pembayaran Pemasok", href: "/pembayaran-pemasok", icon: CreditCard },
      { title: "Penerimaan Pelanggan", href: "/penerimaan-pelanggan", icon: Banknote },
    ],
  },
  {
    label: "Akuntansi",
    items: [
      { title: "Daftar Akun", href: "/daftar-akun", icon: BookOpen },
      { title: "Jurnal Umum", href: "/jurnal-umum", icon: FileText },
      { title: "Buku Besar", href: "/buku-besar", icon: BookMarked },
    ],
  },
  {
    label: "Laporan",
    items: [
      { title: "Neraca Saldo", href: "/neraca-saldo", icon: Scale },
      { title: "Laba Rugi", href: "/laba-rugi", icon: PieChart },
      { title: "Neraca", href: "/neraca", icon: BarChart3 },
    ],
  },
];

// ---------------------------------------------------------------------------
// AppSidebar
// ---------------------------------------------------------------------------

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="offcanvas">
      {/* Brand */}
      <SidebarHeader className="px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold shrink-0">
            A
          </div>
          <span className="font-semibold text-sm text-sidebar-foreground truncate">
            Accounting App
          </span>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      {/* Navigation */}
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      pathname.startsWith(item.href + "/"));

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.title}
                        render={<Link href={item.href} />}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <LogoutButton
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive border-border"
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

