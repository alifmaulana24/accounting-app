"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PurchaseTable } from "@/components/purchases/purchase-table";
import type {
  ApiErrorResponse,
  GetPurchasesResponse,
  PurchaseSummary,
} from "@/types/purchase";

interface PurchasePageClientProps {
  showDeletedNotice: boolean;
}

export function PurchasePageClient({
  showDeletedNotice,
}: PurchasePageClientProps) {
  const [purchases, setPurchases] = React.useState<PurchaseSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showNotice, setShowNotice] = React.useState(showDeletedNotice);

  const fetchPurchases = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/purchases", { cache: "no-store" });
      const json: GetPurchasesResponse | ApiErrorResponse =
        await response.json();

      if (json.success) {
        setPurchases(json.data);
      } else {
        setError(json.message);
      }
    } catch {
      setError("Gagal terhubung ke server. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void Promise.resolve().then(fetchPurchases);
  }, [fetchPurchases]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Pembelian
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola riwayat transaksi pembelian dari pemasok.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/pembelian/tambah" />}
          className="mt-3 gap-1.5 sm:mt-0"
        >
          <Plus className="size-4" />
          Tambah Pembelian
        </Button>
      </div>

      {showNotice && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-lg border border-emerald-500/20 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-200"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="size-4 shrink-0" />
            <p className="font-medium">Transaksi pembelian berhasil dihapus.</p>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setShowNotice(false)}
            aria-label="Tutup notifikasi"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      )}

      <PurchaseTable
        purchases={purchases}
        isLoading={isLoading}
        error={error}
        onRetry={fetchPurchases}
      />
    </div>
  );
}
