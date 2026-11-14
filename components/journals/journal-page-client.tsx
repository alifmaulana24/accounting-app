"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JournalTable } from "@/components/journals/journal-table";
import type {
  GetJournalsResponse,
  JournalCategory,
  JournalApiErrorResponse,
  JournalSummary,
} from "@/types/journal";

export function JournalPageClient() {
  const [journals, setJournals] = React.useState<JournalSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [category, setCategory] = React.useState<JournalCategory>("ALL");
  const requestId = React.useRef(0);

  const fetchJournals = React.useCallback(
    async (selectedCategory: JournalCategory) => {
      const currentRequestId = ++requestId.current;
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/journals?category=${selectedCategory}`,
          { cache: "no-store" },
        );
        const json: GetJournalsResponse | JournalApiErrorResponse =
          await response.json();

        if (!response.ok || !("data" in json) || !Array.isArray(json.data)) {
          if (currentRequestId === requestId.current) {
            setError(
              "message" in json ? json.message : "Gagal memuat data jurnal.",
            );
          }
          return;
        }

        if (currentRequestId === requestId.current) {
          setJournals(json.data);
        }
      } catch {
        if (currentRequestId === requestId.current) {
          setError("Gagal terhubung ke server. Silakan coba lagi.");
        }
      } finally {
        if (currentRequestId === requestId.current) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  React.useEffect(() => {
    void Promise.resolve().then(() => fetchJournals(category));
  }, [category, fetchJournals]);

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
        category={category}
        onCategoryChange={setCategory}
        onRetry={() => fetchJournals(category)}
      />
    </div>
  );
}
