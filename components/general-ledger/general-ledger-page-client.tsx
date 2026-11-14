"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, BookOpen, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import type { Account, GetAccountsResponse } from "@/types/account";
import type {
  GeneralLedgerApiErrorResponse,
  GeneralLedgerReport,
  GetGeneralLedgerResponse,
} from "@/types/general-ledger";

function getCurrentMonthPeriod() {
  const now = new Date();
  const formatDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate(),
    ).padStart(2, "0")}`;

  return {
    startDate: formatDate(new Date(now.getFullYear(), now.getMonth(), 1)),
    endDate: formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  };
}

export function GeneralLedgerPageClient() {
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = React.useState("");
  const [isLoadingAccounts, setIsLoadingAccounts] = React.useState(true);
  const [accountsError, setAccountsError] = React.useState<string | null>(null);
  const [{ startDate, endDate }, setPeriod] = React.useState(
    getCurrentMonthPeriod,
  );
  const [report, setReport] = React.useState<GeneralLedgerReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = React.useState(false);
  const [reportError, setReportError] = React.useState<string | null>(null);
  const accountRequestId = React.useRef(0);
  const reportRequestId = React.useRef(0);

  const fetchAccounts = React.useCallback(async () => {
    const requestId = ++accountRequestId.current;
    setIsLoadingAccounts(true);
    setAccountsError(null);

    try {
      const response = await fetch("/api/accounts", { cache: "no-store" });
      const json: GetAccountsResponse = await response.json();

      if (!response.ok || !("data" in json) || !Array.isArray(json.data)) {
        if (requestId === accountRequestId.current) {
          setAccountsError(
            "error" in json ? json.error : "Gagal mengambil daftar akun.",
          );
        }
        return;
      }

      if (requestId === accountRequestId.current) {
        setAccounts(json.data);
        setSelectedAccountId((currentAccountId) =>
          json.data.some((account) => account.id === currentAccountId)
            ? currentAccountId
            : (json.data[0]?.id ?? ""),
        );
      }
    } catch {
      if (requestId === accountRequestId.current) {
        setAccountsError("Gagal terhubung ke server. Silakan coba lagi.");
      }
    } finally {
      if (requestId === accountRequestId.current) {
        setIsLoadingAccounts(false);
      }
    }
  }, []);

  const fetchReport = React.useCallback(
    async (accountId: string, periodStart: string, periodEnd: string) => {
      const requestId = ++reportRequestId.current;
      setIsLoadingReport(true);
      setReportError(null);

      try {
        const params = new URLSearchParams({
          accountId,
          startDate: periodStart,
          endDate: periodEnd,
        });
        const response = await fetch(
          `/api/general-ledger?${params.toString()}`,
          { cache: "no-store" },
        );
        const json:
          | GetGeneralLedgerResponse
          | GeneralLedgerApiErrorResponse = await response.json();

        if (
          !response.ok ||
          !("data" in json) ||
          !Array.isArray(json.data.transactions)
        ) {
          if (requestId === reportRequestId.current) {
            setReportError(
              "message" in json
                ? json.message
                : "Gagal mengambil data Buku Besar.",
            );
          }
          return;
        }

        if (requestId === reportRequestId.current) {
          setReport(json.data);
        }
      } catch {
        if (requestId === reportRequestId.current) {
          setReportError("Gagal terhubung ke server. Silakan coba lagi.");
        }
      } finally {
        if (requestId === reportRequestId.current) {
          setIsLoadingReport(false);
        }
      }
    },
    [],
  );

  React.useEffect(() => {
    void Promise.resolve().then(fetchAccounts);
  }, [fetchAccounts]);

  const isPeriodMissing = !startDate || !endDate;
  const isPeriodInvalid = isPeriodMissing || startDate > endDate;

  React.useEffect(() => {
    if (!selectedAccountId || isPeriodInvalid) return;
    void Promise.resolve().then(() =>
      fetchReport(selectedAccountId, startDate, endDate),
    );
  }, [
    endDate,
    fetchReport,
    isPeriodInvalid,
    selectedAccountId,
    startDate,
  ]);

  const currentReport =
    report?.account.id === selectedAccountId &&
    report.period.startDate === startDate &&
    report.period.endDate === endDate
      ? report
      : null;
  const selectedAccount = accounts.find(
    (account) => account.id === selectedAccountId,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Buku Besar
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Lihat saldo dan mutasi akun berdasarkan periode.
        </p>
      </div>

      <section
        aria-label="Filter Buku Besar"
        className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-3 sm:items-end"
      >
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Akun</span>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoadingAccounts || accounts.length === 0}
                  aria-label="Pilih akun Buku Besar"
                  className="w-full justify-between gap-2 font-normal"
                >
                  <span className="truncate text-left">
                    {selectedAccount
                      ? `${selectedAccount.code} - ${selectedAccount.name}`
                      : isLoadingAccounts
                        ? "Memuat akun..."
                        : "Pilih akun"}
                  </span>
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                </Button>
              }
            />
            <DropdownMenuContent align="start" className="max-h-72">
              <DropdownMenuRadioGroup
                value={selectedAccountId}
                onValueChange={(accountId) => setSelectedAccountId(accountId)}
              >
                {accounts.map((account) => (
                  <DropdownMenuRadioItem key={account.id} value={account.id}>
                    {account.code} - {account.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <label className="flex flex-col gap-2 text-sm font-medium">
          Tanggal Awal
          <Input
            type="date"
            value={startDate}
            onChange={(event) =>
              setPeriod((period) => ({
                ...period,
                startDate: event.target.value,
              }))
            }
            aria-label="Tanggal awal"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium">
          Tanggal Akhir
          <Input
            type="date"
            value={endDate}
            onChange={(event) =>
              setPeriod((period) => ({
                ...period,
                endDate: event.target.value,
              }))
            }
            aria-label="Tanggal akhir"
          />
        </label>

        {accountsError && (
          <div
            role="alert"
            className="flex flex-col gap-2 text-sm text-destructive sm:col-span-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>{accountsError}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchAccounts()}
            >
              Coba Muat Akun Lagi
            </Button>
          </div>
        )}

        {!isLoadingAccounts &&
          !accountsError &&
          accounts.length === 0 && (
            <p className="text-sm text-muted-foreground sm:col-span-3">
              Belum ada akun COA yang tersedia.
            </p>
          )}

        {isPeriodInvalid && (
          <p
            role="alert"
            className="text-sm text-destructive sm:col-span-3"
          >
            {isPeriodMissing
              ? "Tanggal awal dan akhir wajib diisi."
              : "Tanggal awal tidak boleh melebihi tanggal akhir."}
          </p>
        )}
      </section>

      {selectedAccountId && !isPeriodInvalid && reportError && (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-10 text-center"
        >
          <AlertCircle className="size-8 text-destructive" />
          <div>
            <p className="text-sm font-medium">Gagal memuat Buku Besar</p>
            <p className="mt-1 text-sm text-muted-foreground">{reportError}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              void fetchReport(selectedAccountId, startDate, endDate)
            }
          >
            Coba Lagi
          </Button>
        </div>
      )}

      {selectedAccountId && !isPeriodInvalid && isLoadingReport && (
        <>
          <div
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
            aria-label="Memuat ringkasan saldo"
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-card p-4"
              >
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-3 h-6 w-36" />
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-full" />
              ))}
            </div>
          </div>
        </>
      )}

      {currentReport && !isLoadingReport && !reportError && (
        <>
          <section
            aria-label="Ringkasan saldo Buku Besar"
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          >
            {[
              ["Saldo Awal", currentReport.openingBalance],
              ["Total Debit", currentReport.totalDebit],
              ["Total Kredit", currentReport.totalCredit],
              ["Saldo Akhir", currentReport.closingBalance],
            ].map(([label, amount]) => (
              <div
                key={label}
                className="rounded-xl border border-border bg-card p-4"
              >
                <p className="text-sm font-medium text-muted-foreground">
                  {label}
                </p>
                <p className="mt-2 text-xl font-semibold tabular-nums text-foreground">
                  {formatRupiah(amount)}
                </p>
              </div>
            ))}
          </section>

          {currentReport.transactions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-12 text-center">
              <BookOpen className="size-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  Tidak ada mutasi pada periode ini
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Belum ada transaksi untuk akun{" "}
                  {currentReport.account.code} - {currentReport.account.name}{" "}
                  dalam rentang tanggal yang dipilih.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nomor Jurnal</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Kredit</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentReport.transactions.map((transaction, index) => (
                    <TableRow
                      key={`${transaction.journalEntryId}-${transaction.lineNumber}-${index}`}
                    >
                      <TableCell>
                        {formatJournalDate(transaction.journalDate)}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/jurnal-umum/${encodeURIComponent(
                            transaction.journalEntryId,
                          )}`}
                          className="font-mono text-primary underline-offset-4 hover:underline"
                        >
                          {transaction.journalNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="min-w-56 whitespace-normal">
                        {transaction.description}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatRupiah(transaction.debit)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatRupiah(transaction.credit)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatRupiah(transaction.runningBalance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      {!selectedAccountId &&
        !isLoadingAccounts &&
        !accountsError &&
        accounts.length > 0 && (
          <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
            Pilih akun untuk melihat Buku Besar.
          </div>
        )}
    </div>
  );
}
