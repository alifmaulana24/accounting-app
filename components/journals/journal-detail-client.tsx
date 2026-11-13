"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatJournalDate,
  formatRupiah,
} from "@/components/journals/journal-format";
import type {
  GetJournalDetailResponse,
  JournalApiErrorResponse,
  JournalDetail,
} from "@/types/journal";

interface JournalDetailClientProps {
  journalId: string;
  createdNotice: boolean;
}

export function JournalDetailClient({
  journalId,
  createdNotice,
}: JournalDetailClientProps) {
  const [journal, setJournal] = React.useState<JournalDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchJournal = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/journals/${encodeURIComponent(journalId)}`,
        { cache: "no-store" },
      );
      const json: GetJournalDetailResponse | JournalApiErrorResponse =
        await response.json();

      if (!response.ok || !("data" in json)) {
        setError(
          "message" in json
            ? json.message
            : "Gagal memuat detail jurnal.",
        );
        setJournal(null);
        return;
      }

      setJournal(json.data);
    } catch {
      setError("Gagal terhubung ke server. Silakan coba lagi.");
      setJournal(null);
    } finally {
      setIsLoading(false);
    }
  }, [journalId]);

  React.useEffect(() => {
    void Promise.resolve().then(fetchJournal);
  }, [fetchJournal]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex items-start gap-3">
        <Button
          nativeButton={false}
          variant="outline"
          size="icon"
          render={<Link href="/jurnal-umum" />}
          aria-label="Kembali ke daftar jurnal"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Detail General Journal
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Informasi dan rincian jurnal tersimpan.
          </p>
        </div>
      </div>

      {createdNotice && (
        <div
          role="status"
          className="flex items-center gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-200"
        >
          <CheckCircle2 className="size-4 shrink-0" />
          <p className="font-medium">Jurnal berhasil disimpan.</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="mt-4 h-4 w-full max-w-96" />
            <Skeleton className="mt-3 h-4 w-60" />
          </section>
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <Skeleton className="h-48 w-full" />
          </section>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-5">
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">Gagal memuat detail jurnal</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void fetchJournal()}
            className="mt-3"
          >
            Coba Lagi
          </Button>
        </div>
      ) : journal ? (
        <>
          <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <ClipboardList className="size-5 text-primary" />
              <h2 className="text-base font-semibold">Informasi Jurnal</h2>
            </div>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">Nomor Jurnal</dt>
                <dd className="mt-1 font-mono text-sm font-semibold">
                  {journal.journalNumber}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Tanggal Jurnal</dt>
                <dd className="mt-1 text-sm font-medium">
                  {formatJournalDate(journal.journalDate, "long")}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Deskripsi</dt>
                <dd className="mt-1 text-sm font-medium">
                  {journal.description}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Sumber Jurnal</dt>
                <dd className="mt-1 text-sm font-medium">
                  {journal.sourceType}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-border bg-card shadow-sm">
            <div className="p-5 sm:p-6">
              <h2 className="text-base font-semibold">Rincian Jurnal</h2>
            </div>
            <div className="flex flex-col gap-3 px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="hidden grid-cols-[minmax(80px,0.55fr)_minmax(140px,1fr)_minmax(160px,1.4fr)_minmax(140px,1fr)_minmax(140px,1fr)] gap-4 border-b border-border px-4 pb-3 text-xs font-medium text-muted-foreground md:grid">
                <span>Kode Akun</span>
                <span>Nama Akun</span>
                <span>Keterangan</span>
                <span className="text-right">Debit</span>
                <span className="text-right">Kredit</span>
              </div>
              {journal.lines.map((line) => (
                <div
                  key={line.id}
                  className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-[minmax(80px,0.55fr)_minmax(140px,1fr)_minmax(160px,1.4fr)_minmax(140px,1fr)_minmax(140px,1fr)] md:items-center md:rounded-none md:border-x-0 md:border-t-0 md:px-4 md:py-4"
                >
                  <div>
                    <span className="text-xs text-muted-foreground md:hidden">
                      Kode Akun
                    </span>
                    <p className="font-mono text-xs font-medium">
                      {line.account.code}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground md:hidden">
                      Nama Akun
                    </span>
                    <p className="text-sm font-medium">{line.account.name}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground md:hidden">
                      Keterangan
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {line.description || "-"}
                    </p>
                  </div>
                  <div className="flex items-baseline justify-between gap-3 md:block md:text-right">
                    <span className="text-xs text-muted-foreground md:hidden">
                      Debit
                    </span>
                    <p className="text-sm tabular-nums">
                      {formatRupiah(line.debit)}
                    </p>
                  </div>
                  <div className="flex items-baseline justify-between gap-3 md:block md:text-right">
                    <span className="text-xs text-muted-foreground md:hidden">
                      Kredit
                    </span>
                    <p className="text-sm tabular-nums">
                      {formatRupiah(line.credit)}
                    </p>
                  </div>
                </div>
              ))}
              <div className="grid gap-3 rounded-lg bg-muted/40 p-4 sm:grid-cols-2 sm:gap-6 sm:p-5 md:ml-auto md:w-2/3 md:grid-cols-2">
                <div className="flex items-baseline justify-between gap-4 sm:block sm:text-right">
                  <p className="text-xs text-muted-foreground">Total Debit</p>
                  <p className="mt-1 text-base font-semibold tabular-nums">
                    {formatRupiah(journal.totalDebit)}
                  </p>
                </div>
                <div className="flex items-baseline justify-between gap-4 sm:block sm:text-right">
                  <p className="text-xs text-muted-foreground">Total Kredit</p>
                  <p className="mt-1 text-base font-semibold tabular-nums">
                    {formatRupiah(journal.totalCredit)}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
