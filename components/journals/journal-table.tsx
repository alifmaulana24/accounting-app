"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  CalendarDays,
  ClipboardList,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatJournalDate,
  formatRupiah,
} from "@/components/journals/journal-format";
import type { JournalSummary } from "@/types/journal";

interface JournalTableProps {
  journals: JournalSummary[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function JournalTable({
  journals,
  isLoading,
  error,
  onRetry,
}: JournalTableProps) {
  const [search, setSearch] = React.useState("");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");

  const filtered = React.useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id-ID");
    return journals.filter((journal) => {
      const matchesSearch =
        !query ||
        journal.journalNumber.toLocaleLowerCase("id-ID").includes(query) ||
        journal.description.toLocaleLowerCase("id-ID").includes(query);
      const journalDate = journal.journalDate.slice(0, 10);
      const matchesDate =
        (!dateFrom || journalDate >= dateFrom) &&
        (!dateTo || journalDate <= dateTo);
      return matchesSearch && matchesDate;
    });
  }, [dateFrom, dateTo, journals, search]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_minmax(170px,220px)_minmax(170px,220px)]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Cari nomor jurnal atau deskripsi"
            placeholder="Cari nomor jurnal atau deskripsi..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-8"
          />
        </div>
        <label className="flex items-center gap-2 rounded-md border border-input px-2.5">
          <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
          <span className="sr-only">Tanggal mulai</span>
          <Input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            aria-label="Tanggal mulai"
            className="border-0 px-0 shadow-none focus-visible:ring-0"
          />
        </label>
        <label className="flex items-center gap-2 rounded-md border border-input px-2.5">
          <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
          <span className="sr-only">Tanggal akhir</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            aria-label="Tanggal akhir"
            className="border-0 px-0 shadow-none focus-visible:ring-0"
          />
        </label>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3" aria-label="Memuat jurnal">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="grid gap-4 rounded-xl border border-border bg-card p-5 sm:p-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(110px,0.45fr)_minmax(280px,1fr)] lg:items-center"
            >
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-full max-w-80" />
              </div>
              <Skeleton className="h-4 w-20" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="ml-auto h-4 w-28" />
                <Skeleton className="ml-auto h-4 w-28" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center">
          <AlertCircle className="size-8 text-destructive" />
          <div>
            <p className="text-sm font-medium">Gagal memuat jurnal</p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Coba Lagi
          </Button>
        </div>
      ) : journals.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <ClipboardList className="size-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Belum ada jurnal</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Jurnal yang tercatat akan tampil di sini.
            </p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <Search className="size-7 text-muted-foreground" />
          <p className="text-sm font-medium">Jurnal tidak ditemukan</p>
          <p className="text-sm text-muted-foreground">
            Ubah kata kunci atau rentang tanggal.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((journal) => (
            <Link
              key={journal.id}
              href={`/jurnal-umum/${encodeURIComponent(journal.id)}`}
              aria-label={`Buka jurnal ${journal.journalNumber}`}
              className="block rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/20 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-6"
            >
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(110px,0.45fr)_minmax(280px,1fr)] lg:items-center">
                <div className="min-w-0">
                  <h2 className="truncate font-mono text-base font-semibold tracking-tight text-foreground sm:text-lg">
                    {journal.journalNumber}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatJournalDate(journal.journalDate)}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                    {journal.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 lg:block">
                  <span className="text-xs text-muted-foreground lg:hidden">
                    Sumber
                  </span>
                  <span className="font-mono text-xs font-medium tracking-wide text-muted-foreground">
                    {journal.sourceType}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Total Debit</p>
                    <p className="mt-1 truncate text-sm font-semibold tabular-nums sm:text-base">
                      {formatRupiah(journal.totalDebit)}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Total Kredit</p>
                    <p className="mt-1 truncate text-sm font-semibold tabular-nums sm:text-base">
                      {formatRupiah(journal.totalCredit)}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      {!isLoading && !error && journals.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Menampilkan {filtered.length} dari {journals.length} jurnal
        </p>
      )}
    </div>
  );
}
