"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/components/journals/journal-format";
import type { Account, GetAccountsResponse } from "@/types/account";
import type {
  CreateJournalResponse,
  JournalApiErrorResponse,
} from "@/types/journal";

interface JournalFormLine {
  id: number;
  accountId: string;
  description: string;
  debit: string;
  credit: string;
}

function getLocalDate() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function getApiValidationMessages(error: JournalApiErrorResponse) {
  const fieldMessages = Object.entries(error.errors?.fieldErrors ?? {}).flatMap(
    ([field, messages]) =>
      (messages ?? []).map((message) => `${field}: ${message}`),
  );
  return [...(error.errors?.formErrors ?? []), ...fieldMessages];
}

function createEmptyLine(id: number): JournalFormLine {
  return { id, accountId: "", description: "", debit: "0", credit: "0" };
}

export function JournalCreateForm() {
  const router = useRouter();
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = React.useState(true);
  const [accountError, setAccountError] = React.useState<string | null>(null);
  const [journalDate, setJournalDate] = React.useState(getLocalDate);
  const [description, setDescription] = React.useState("");
  const [lines, setLines] = React.useState<JournalFormLine[]>([
    createEmptyLine(1),
    createEmptyLine(2),
  ]);
  const [nextLineId, setNextLineId] = React.useState(3);
  const [isPending, setIsPending] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [validationMessages, setValidationMessages] = React.useState<string[]>(
    [],
  );

  const loadAccounts = React.useCallback(async () => {
    setIsLoadingAccounts(true);
    setAccountError(null);
    try {
      const response = await fetch("/api/accounts", { cache: "no-store" });
      const json: GetAccountsResponse = await response.json();

      if (!response.ok || !("data" in json) || !Array.isArray(json.data)) {
        throw new Error(
          "error" in json ? json.error : "Gagal memuat data akun.",
        );
      }

      setAccounts(json.data.filter((account) => account.isActive));
    } catch (error) {
      setAccountError(
        error instanceof Error
          ? error.message
          : "Gagal memuat data akun.",
      );
    } finally {
      setIsLoadingAccounts(false);
    }
  }, []);

  React.useEffect(() => {
    void Promise.resolve().then(loadAccounts);
  }, [loadAccounts]);

  const totalDebit = lines.reduce((total, line) => {
    const debit = Number(line.debit);
    return Number.isSafeInteger(debit) && debit >= 0 ? total + debit : total;
  }, 0);
  const totalCredit = lines.reduce((total, line) => {
    const credit = Number(line.credit);
    return Number.isSafeInteger(credit) && credit >= 0
      ? total + credit
      : total;
  }, 0);
  const isBalanced =
    Number.isSafeInteger(totalDebit) &&
    Number.isSafeInteger(totalCredit) &&
    totalDebit > 0 &&
    totalDebit === totalCredit;

  const hasValidLines =
    lines.length >= 2 &&
    lines.every((line) => {
      const debit = Number(line.debit);
      const credit = Number(line.credit);
      return (
        Boolean(line.accountId) &&
        Number.isSafeInteger(debit) &&
        debit >= 0 &&
        Number.isSafeInteger(credit) &&
        credit >= 0 &&
        ((debit > 0 && credit === 0) || (credit > 0 && debit === 0))
      );
    });
  const canSubmit =
    Boolean(journalDate) &&
    Boolean(description.trim()) &&
    description.trim().length <= 255 &&
    hasValidLines &&
    isBalanced &&
    accounts.length > 0 &&
    !isLoadingAccounts &&
    !isPending;

  function updateLine(id: number, patch: Partial<JournalFormLine>) {
    setLines((current) =>
      current.map((line) => (line.id === id ? { ...line, ...patch } : line)),
    );
    setServerError(null);
    setValidationMessages([]);
  }

  function addLine() {
    setLines((current) => [...current, createEmptyLine(nextLineId)]);
    setNextLineId((current) => current + 1);
  }

  function removeLine(id: number) {
    setLines((current) => current.filter((line) => line.id !== id));
    setServerError(null);
    setValidationMessages([]);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);
    setValidationMessages([]);

    if (!journalDate) {
      setServerError("Tanggal jurnal wajib diisi.");
      return;
    }
    if (!description.trim() || description.trim().length > 255) {
      setServerError(
        "Deskripsi wajib diisi dan maksimal 255 karakter.",
      );
      return;
    }
    if (lines.length < 2) {
      setServerError("Jurnal minimal memiliki dua baris.");
      return;
    }
    if (!hasValidLines) {
      setServerError(
        "Pilih akun dan isi tepat satu nilai debit atau kredit pada setiap baris.",
      );
      return;
    }
    if (!isBalanced) {
      setServerError("Total debit dan kredit harus seimbang dan lebih dari Rp0.");
      return;
    }

    setIsPending(true);
    try {
      const response = await fetch("/api/journals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journalDate,
          description: description.trim(),
          lines: lines.map((line) => ({
            accountId: line.accountId,
            description: line.description.trim(),
            debit: Number(line.debit),
            credit: Number(line.credit),
          })),
        }),
      });
      const json: CreateJournalResponse | JournalApiErrorResponse =
        await response.json();

      if (!response.ok || !("data" in json)) {
        setServerError(
          "message" in json ? json.message : "Gagal menyimpan jurnal.",
        );
        setValidationMessages(
          "message" in json ? getApiValidationMessages(json) : [],
        );
        return;
      }

      router.push(
        `/jurnal-umum/${encodeURIComponent(json.data.id)}?created=1`,
      );
    } catch {
      setServerError("Gagal terhubung ke server. Silakan coba lagi.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
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
            Tambah Jurnal
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Catat jurnal manual yang seimbang.
          </p>
        </div>
      </div>

      {accountError ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-5">
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>{accountError}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadAccounts()}
            className="mt-3"
          >
            Coba Lagi
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold">Informasi Jurnal</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Tanggal Jurnal
                <Input
                  type="date"
                  value={journalDate}
                  onChange={(event) => setJournalDate(event.target.value)}
                  disabled={isPending || isLoadingAccounts}
                  required
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Deskripsi Jurnal
                <Input
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value);
                    setServerError(null);
                    setValidationMessages([]);
                  }}
                  maxLength={255}
                  disabled={isPending || isLoadingAccounts}
                  placeholder="Deskripsi jurnal"
                  required
                />
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold">Rincian Jurnal</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Setiap baris hanya dapat berisi debit atau kredit.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLine}
                disabled={isPending || isLoadingAccounts || accounts.length === 0}
                className="gap-1.5"
              >
                <Plus className="size-4" />
                Tambah Baris
              </Button>
            </div>

            {isLoadingAccounts ? (
              <p className="mt-5 text-sm text-muted-foreground">
                Memuat daftar akun...
              </p>
            ) : accounts.length === 0 ? (
              <p className="mt-5 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Belum ada akun aktif yang dapat dipilih.
              </p>
            ) : (
              <div className="mt-5 flex flex-col gap-4">
                {lines.map((line, index) => (
                  <div
                    key={line.id}
                    className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-2 lg:grid-cols-[minmax(200px,1.5fr)_minmax(160px,1.2fr)_minmax(120px,1fr)_minmax(120px,1fr)_auto] lg:items-end"
                  >
                    <label className="flex flex-col gap-1.5 text-sm font-medium">
                      Akun
                      <select
                        value={line.accountId}
                        onChange={(event) =>
                          updateLine(line.id, { accountId: event.target.value })
                        }
                        disabled={isPending}
                        required
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-normal shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                      >
                        <option value="">Pilih akun aktif</option>
                        {accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.code} - {account.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm font-medium">
                      Keterangan
                      <Input
                        value={line.description}
                        onChange={(event) =>
                          updateLine(line.id, {
                            description: event.target.value,
                          })
                        }
                        maxLength={255}
                        disabled={isPending}
                        placeholder="Opsional"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm font-medium">
                      Debit
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        inputMode="numeric"
                        value={line.debit}
                        onChange={(event) => {
                          const debit = event.target.value;
                          updateLine(line.id, {
                            debit,
                            ...(Number(debit) > 0 ? { credit: "0" } : {}),
                          });
                        }}
                        disabled={isPending}
                        required
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm font-medium">
                      Kredit
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        inputMode="numeric"
                        value={line.credit}
                        onChange={(event) => {
                          const credit = event.target.value;
                          updateLine(line.id, {
                            credit,
                            ...(Number(credit) > 0 ? { debit: "0" } : {}),
                          });
                        }}
                        disabled={isPending}
                        required
                      />
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLine(line.id)}
                      disabled={isPending || lines.length <= 2}
                      aria-label={`Hapus baris jurnal ${index + 1}`}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold">Total Jurnal</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/50 p-4">
                <span className="text-sm text-muted-foreground">Total Debit</span>
                <span className="font-semibold tabular-nums">
                  {formatRupiah(totalDebit)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/50 p-4">
                <span className="text-sm text-muted-foreground">
                  Total Kredit
                </span>
                <span className="font-semibold tabular-nums">
                  {formatRupiah(totalCredit)}
                </span>
              </div>
            </div>
            <p
              className={`mt-3 flex items-center gap-2 text-sm font-medium ${
                isBalanced ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
              }`}
              role="status"
            >
              <CheckCircle2 className="size-4" />
              {isBalanced
                ? "Jurnal seimbang."
                : "Jurnal belum seimbang atau total masih Rp0."}
            </p>
          </section>

          {(serverError || validationMessages.length > 0) && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
            >
              {serverError && <p className="font-medium">{serverError}</p>}
              {validationMessages.length > 0 && (
                <ul className="mt-1 list-inside list-disc">
                  {validationMessages.map((message, index) => (
                    <li key={`${message}-${index}`}>{message}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              nativeButton={false}
              variant="outline"
              render={<Link href="/jurnal-umum" />}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={!canSubmit} className="gap-2">
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Simpan Jurnal
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
