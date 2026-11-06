import { getSession } from "@/lib/session";
import {
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

export const instant = false;

// ---------------------------------------------------------------------------
// Summary card data (dummy)
// ---------------------------------------------------------------------------

const summaryCards = [
  {
    label: "Total Produk",
    value: "248",
    icon: Package,
    description: "Produk aktif",
  },
  {
    label: "Total Pelanggan",
    value: "134",
    icon: Users,
    description: "Pelanggan terdaftar",
  },
  {
    label: "Total Pembelian",
    value: "Rp 48.500.000",
    icon: ShoppingCart,
    description: "Bulan ini",
  },
  {
    label: "Total Penjualan",
    value: "Rp 72.300.000",
    icon: TrendingUp,
    description: "Bulan ini",
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <div className="flex flex-col gap-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Selamat datang di Accounting System for Purchase and Sales
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {card.label}
              </p>
              <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                <card.icon className="size-4 text-foreground" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
