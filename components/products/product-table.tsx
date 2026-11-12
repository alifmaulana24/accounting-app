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
  AlertCircle,
  PackageOpen,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Product } from "@/types/product";

// ---------------------------------------------------------------------------
// Loading skeletons
// ---------------------------------------------------------------------------

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
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
// Status filter values
// ---------------------------------------------------------------------------

type StatusFilter = "all" | "active" | "inactive";

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: "Semua Status",
  active: "Aktif",
  inactive: "Nonaktif",
};

// ---------------------------------------------------------------------------
// Product Table
// ---------------------------------------------------------------------------

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onRequestEdit?: (product: Product) => void;
  onRequestDelete?: (product: Product) => void;
}

export function ProductTable({
  products,
  isLoading,
  error,
  onRetry,
  onRequestEdit,
  onRequestDelete,
}: ProductTableProps) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");

  // Filter produk berdasarkan pencarian dan status
  const filtered = React.useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      const matchSearch =
        !q ||
        p.sku.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && p.isActive) ||
        (statusFilter === "inactive" && !p.isActive);
      return matchSearch && matchStatus;
    });
  }, [products, search, statusFilter]);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar: search + filter */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari SKU atau nama produk..."
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
              <DropdownMenuRadioItem value="all">Semua Status</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="active">Aktif</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="inactive">Nonaktif</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">SKU</TableHead>
              <TableHead>Nama Produk</TableHead>
              <TableHead className="w-36">Kategori</TableHead>
              <TableHead className="w-32">Brand</TableHead>
              <TableHead className="w-24">Satuan</TableHead>
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

            {/* Empty state: belum ada data sama sekali */}
            {!isLoading && !error && products.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <PackageOpen className="size-8 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Belum ada produk
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Tambahkan produk pertama menggunakan tombol di atas.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Empty state: hasil pencarian kosong */}
            {!isLoading && !error && products.length > 0 && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <Search className="size-8 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Produk tidak ditemukan
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
              filtered.map((product) => (
                <TableRow key={product.sku}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {product.sku}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {product.category}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {product.brand ?? (
                      <span className="text-xs italic text-muted-foreground/60">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {product.unit}
                  </TableCell>
                  <TableCell>
                    {product.isActive ? (
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
                        title="Edit produk"
                        onClick={() => onRequestEdit?.(product)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Hapus produk"
                        onClick={() => onRequestDelete?.(product)}
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

      {/* Footer info */}
      {!isLoading && !error && products.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Menampilkan {filtered.length} dari {products.length} produk
        </p>
      )}
    </div>
  );
}

