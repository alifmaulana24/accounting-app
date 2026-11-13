"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JournalTable } from "@/components/journals/journal-table";
import type {
  GetJournalsResponse,
  JournalApiErrorResponse,
  JournalSummary,
} from "@/types/journal";

export function JournalPageClient() {
  const [journals, setJournals] = React.useState<JournalSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchJournals = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/journals", { cache: "no-store" });
      const json: GetJournalsResponse | JournalApiErrorResponse =
        await response.json();

      if (!response.ok || !("data" in json) || !Array.isArray(json.data)) {
        setError(
          "message" in json ? json.message : "Gagal memuat data jurnal.",
        );
        return;
      }

      setJournals(json.data);
    } catch {
      setError("Gagal terhubung ke server. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void Promise.resolve().then(fetchJournals);
  }, [fetchJournals]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            General Journal
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lihat dan catat jurnal transaksi.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/jurnal-umum/tambah" />}
          className="mt-3 gap-1.5 sm:mt-0"
        >
          <Plus className="size-4" />
          Tambah Jurnal
        </Button>
      </div>

      <JournalTable
        journals={journals}
        isLoading={isLoading}
        error={error}
        onRetry={fetchJournals}
      />
    </div>
  );
}
