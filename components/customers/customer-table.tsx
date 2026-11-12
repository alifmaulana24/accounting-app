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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Users,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Customer } from "@/types/customer";

// ---------------------------------------------------------------------------
// Loading skeletons
// ---------------------------------------------------------------------------

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-36" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-48" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-24 ml-auto" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Status filter values
// ---------------------------------------------------------------------------

type StatusFilter = "all" | "active" | "inactive";

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: "Semua Status",
  active: "Aktif",
  inactive: "Nonaktif",
};

const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Customer Table
// ---------------------------------------------------------------------------

interface CustomerTableProps {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onRequestDetail?: (customer: Customer) => void;
  onRequestEdit: (customer: Customer) => void;
  onRequestDelete: (customer: Customer) => void;
}

export function CustomerTable({
  customers,
  isLoading,
  error,
  onRetry,
  onRequestDetail,
  onRequestEdit,
  onRequestDelete,
}: CustomerTableProps) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = React.useState(1);

  // Reset page to 1 when search or status filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    return customers.filter((c) => {
      const matchSearch =
        !q ||
        c.customerCode.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && c.isActive) ||
        (statusFilter === "inactive" && !c.isActive);
      return matchSearch && matchStatus;
    });
  }, [customers, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar: search + filter */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari kode atau nama customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" className="gap-1.5 shrink-0">
                {STATUS_LABELS[statusFilter]}
                <ChevronDown className="size-4 text-muted-foreground" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            >
              <DropdownMenuRadioItem value="all">
                Semua Status
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="active">Aktif</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="inactive">
                Nonaktif
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Kode Customer</TableHead>
              <TableHead>Nama Customer</TableHead>
              <TableHead className="w-36">Nomor Telepon</TableHead>
              <TableHead className="w-48">Email</TableHead>
              <TableHead>Alamat</TableHead>
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
                <TableCell colSpan={7}>
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

            {/* Empty state: belum ada data */}
            {!isLoading && !error && customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <Users className="size-8 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Belum ada customer
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Tambahkan customer pertama menggunakan tombol di atas.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Empty state: hasil pencarian kosong */}
            {!isLoading &&
              !error &&
              customers.length > 0 &&
              filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="flex flex-col items-center gap-3 py-10 text-center">
                      <Search className="size-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Customer tidak ditemukan
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          Coba ubah kata kunci atau filter yang digunakan.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}

            {/* Data rows */}
            {!isLoading &&
              !error &&
              paginated.map((customer) => (
                <TableRow key={customer.customerCode}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {customer.customerCode}
                  </TableCell>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {customer.phone ?? (
                      <span className="text-xs italic text-muted-foreground/60">
                        -
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {customer.email ?? (
                      <span className="text-xs italic text-muted-foreground/60">
                        -
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px]">
                    {customer.address ? (
                      <span
                        className="block truncate"
                        title={customer.address}
                      >
                        {customer.address}
                      </span>
                    ) : (
                      <span className="text-xs italic text-muted-foreground/60">
                        -
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {customer.isActive ? (
                      <Badge
                        variant="default"
                        className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0"
                      >
                        Aktif
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Nonaktif</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {onRequestDetail && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Detail customer"
                          onClick={() => onRequestDetail(customer)}
                        >
                          <Eye className="size-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Edit customer"
                        onClick={() => onRequestEdit(customer)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Hapus customer"
                        onClick={() => onRequestDelete(customer)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer info & pagination */}
      {!isLoading && !error && customers.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            {filtered.length === 0
              ? "0 customer ditemukan"
              : `Menampilkan ${startIndex + 1}–${Math.min(
                  startIndex + PAGE_SIZE,
                  filtered.length
                )} dari ${filtered.length} customer${
                  filtered.length !== customers.length
                    ? ` (difilter dari ${customers.length} total)`
                    : ""
                }`}
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="gap-1 text-xs"
              >
                <ChevronLeft className="size-3.5" />
                <span>Sebelumnya</span>
              </Button>
              <span className="px-2 text-xs font-medium text-muted-foreground">
                Halaman {safePage} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={safePage >= totalPages}
                className="gap-1 text-xs"
              >
                <span>Berikutnya</span>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
