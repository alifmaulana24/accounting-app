"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatJournalDate,
  formatRupiah,
} from "@/components/journals/journal-format";
import type {
  DashboardApiErrorResponse,
  DashboardData,
  GetDashboardResponse,
} from "@/types/dashboard";

const DISPLAYED_ACCOUNT_CODES = new Set(["101", "103", "104", "201", "401"]);

const SOURCE_TYPE_LABELS: Record<string, string> = {
  MANUAL: "Jurnal Manual",
  PURCHASE: "Pembelian",
  PURCHASE_PAYMENT: "Pembayaran Pembelian",
  SALE: "Penjualan",
  SALE_PAYMENT: "Pembayaran Penjualan",
};

export function DashboardPageClient() {
  const [dashboard, setDashboard] = React.useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchDashboard = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/dashboard", { cache: "no-store" });
      const json: GetDashboardResponse | DashboardApiErrorResponse =
        await response.json();

      if (
        !response.ok ||
        !("data" in json) ||
        !Array.isArray(json.data.accountBalances) ||
        !Array.isArray(json.data.recentJournals)
      ) {
        setError(
          "message" in json
            ? json.message
            : "Gagal mengambil data Dashboard.",
        );
        return;
      }

      setDashboard(json.data);
    } catch {
      setError("Gagal terhubung ke server. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void Promise.resolve().then(fetchDashboard);
  }, [fetchDashboard]);

  const accountBalances =
    dashboard?.accountBalances.filter((account) =>
      DISPLAYED_ACCOUNT_CODES.has(account.code),
    ) ?? [];
  const recentJournals = dashboard?.recentJournals.slice(0, 5) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Selamat datang di Accounting System for Purchase and Sales
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center"
        >
          <AlertCircle className="size-8 text-destructive" />
          <div>
            <p className="text-sm font-medium">Gagal memuat Dashboard</p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void fetchDashboard()}
          >
            Coba Lagi
          </Button>
        </div>
      ) : (
        <>
          <section aria-labelledby="account-balances-heading">
            <h2
              id="account-balances-heading"
              className="mb-3 text-lg font-semibold tracking-tight text-foreground"
            >
              Saldo Akun
            </h2>
            {isLoading ? (
              <div
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5"
                aria-label="Memuat saldo akun"
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-border bg-card p-5 shadow-sm"
                  >
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="mt-2 h-4 w-32" />
                    <Skeleton className="mt-5 h-7 w-36" />
                  </div>
                ))}
              </div>
            ) : accountBalances.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-6 py-8 text-center text-sm text-muted-foreground">
                Data saldo akun tidak tersedia.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {accountBalances.map((account) => (
                  <article
                    key={account.id}
                    className="rounded-xl border border-border bg-card p-5 shadow-sm"
                  >
                    <p className="text-sm font-medium text-muted-foreground">
                      {account.code}
                    </p>
                    <h3 className="mt-1 min-h-10 text-sm font-medium text-foreground">
                      {account.name}
                    </h3>
                    <p className="mt-3 break-words text-xl font-bold tabular-nums text-foreground">
                      {formatRupiah(account.balance)}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="recent-journals-heading">
            <h2
              id="recent-journals-heading"
              className="mb-3 text-lg font-semibold tracking-tight text-foreground"
            >
              Jurnal Terbaru
            </h2>
            {isLoading ? (
              <div
                className="rounded-xl border border-border bg-card p-4"
                aria-label="Memuat jurnal terbaru"
              >
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-9 w-full" />
                  ))}
                </div>
              </div>
            ) : recentJournals.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-12 text-center">
                <BookOpen className="size-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    Belum ada aktivitas jurnal
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Jurnal yang tercatat akan tampil di sini.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nomor Jurnal</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Sumber</TableHead>
                      <TableHead className="text-right">Total Debit</TableHead>
                      <TableHead className="text-right">Total Kredit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentJournals.map((journal) => (
                      <TableRow key={journal.id}>
                        <TableCell>
                          <Link
                            href={`/jurnal-umum/${encodeURIComponent(
                              journal.id,
                            )}`}
                            className="font-mono text-primary underline-offset-4 hover:underline"
                          >
                            {journal.journalNumber}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {formatJournalDate(journal.journalDate)}
                        </TableCell>
                        <TableCell className="min-w-48 whitespace-normal">
                          {journal.description}
                        </TableCell>
                        <TableCell>
                          {SOURCE_TYPE_LABELS[journal.sourceType] ??
                            journal.sourceType}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatRupiah(journal.totalDebit)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatRupiah(journal.totalCredit)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
