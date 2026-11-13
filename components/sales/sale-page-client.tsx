"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaleTable } from "@/components/sales/sale-table";
import type {
  GetSalesResponse,
  SaleSummary,
} from "@/types/sale";

interface SalePageClientProps {
  notice: "created" | "deleted" | null;
}

export function SalePageClient({ notice: initialNotice }: SalePageClientProps) {
  const [sales, setSales] = React.useState<SaleSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState(initialNotice);

  const fetchSales = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/sales", { cache: "no-store" });
      const json: GetSalesResponse | { success: false; message: string } =
        await response.json();

      if (!response.ok || !json.success) {
        setError(
          json.success ? "Gagal memuat data penjualan." : json.message,
        );
        return;
      }

      setSales(json.data);
    } catch {
      setError("Gagal terhubung ke server. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void Promise.resolve().then(fetchSales);
  }, [fetchSales]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Penjualan
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola riwayat transaksi penjualan kepada pelanggan.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/penjualan/tambah" />}
          className="mt-3 gap-1.5 sm:mt-0"
        >
          <Plus className="size-4" />
          Tambah Penjualan
        </Button>
      </div>

      {notice && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-lg border border-emerald-500/20 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-200"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="size-4 shrink-0" />
            <p className="font-medium">
              {notice === "created"
                ? "Transaksi penjualan berhasil dibuat."
                : "Transaksi penjualan berhasil dihapus."}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setNotice(null)}
            aria-label="Tutup notifikasi"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      )}

      <SaleTable
        sales={sales}
        isLoading={isLoading}
        error={error}
        onRetry={fetchSales}
      />
    </div>
  );
}
