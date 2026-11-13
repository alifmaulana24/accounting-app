"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  AlertCircle,
  BookOpen,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Account } from "@/types/account";

// ---------------------------------------------------------------------------
// Loading skeletons
// ---------------------------------------------------------------------------

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-8 w-20" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Account Table
// ---------------------------------------------------------------------------

interface AccountTableProps {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onRequestEdit?: (account: Account) => void;
  onRequestDelete?: (account: Account) => void;
}

export function AccountTable({
  accounts,
  isLoading,
  error,
  onRetry,
  onRequestEdit,
  onRequestDelete,
}: AccountTableProps) {
  const [search, setSearch] = React.useState("");

  // Filter akun berdasarkan pencarian kode atau nama (sisi frontend)
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return accounts.filter((a) => {
      return (
        !q ||
        a.code.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q)
      );
    });
  }, [accounts, search]);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar: search */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari kode atau nama akun..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Kode Akun</TableHead>
              <TableHead>Nama Akun</TableHead>
              <TableHead className="w-32">Tipe Akun</TableHead>
              <TableHead className="w-28">Saldo Normal</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-28 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Loading state */}
            {isLoading && <TableSkeleton />}

            {/* Error state */}
            {!isLoading && error && (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <AlertCircle className="size-8 text-destructive" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Gagal memuat data
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {error}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={onRetry}>
                      Coba Lagi
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Empty state: belum ada data sama sekali */}
            {!isLoading && !error && accounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <BookOpen className="size-8 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Belum ada akun
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Tambahkan akun pertama menggunakan tombol di atas.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Empty state: hasil pencarian kosong */}
            {!isLoading && !error && accounts.length > 0 && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <Search className="size-8 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Akun tidak ditemukan
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Coba ubah kata kunci pencarian.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Data rows */}
            {!isLoading &&
              !error &&
              filtered.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {account.code}
                  </TableCell>
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      {account.name}
                      {account.isSystem && (
                        <Badge
                          variant="outline"
                          className="px-1.5 py-0 text-[10px] font-normal uppercase tracking-wide text-muted-foreground"
                        >
                          Bawaan
                        </Badge>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {account.accountType}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {account.normalBalance}
                  </TableCell>
                  <TableCell>
                    {account.isActive ? (
                      <Badge variant="default" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0">
                        Aktif
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Nonaktif</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Edit akun"
                        onClick={() => onRequestEdit?.(account)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      {account.isSystem ? (
                        /* Akun bawaan sistem tidak boleh dihapus */
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Akun bawaan sistem tidak dapat dihapus"
                          disabled
                          className="text-muted-foreground/50"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Hapus akun"
                          onClick={() => onRequestDelete?.(account)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer info */}
      {!isLoading && !error && accounts.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Menampilkan {filtered.length} dari {accounts.length} akun
        </p>
      )}
    </div>
  );
}
