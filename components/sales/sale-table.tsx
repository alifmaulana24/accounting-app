"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  PackageOpen,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { SalePaymentStatus, SaleSummary } from "@/types/sale";

type StatusFilter = "all" | SalePaymentStatus;

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: "Semua Status",
  "Belum Dibayar": "Belum Dibayar",
  Sebagian: "Sebagian",
  Lunas: "Lunas",
};

function formatRupiah(value: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function PaymentStatusBadge({ status }: { status: SalePaymentStatus }) {
  if (status === "Lunas") {
    return (
      <Badge className="border-0 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
        Lunas
      </Badge>
    );
  }
  if (status === "Sebagian") {
    return (
      <Badge className="border-0 bg-amber-500/15 text-amber-700 dark:text-amber-400">
        Sebagian
      </Badge>
    );
  }
  return <Badge variant="secondary">Belum Dibayar</Badge>;
}

interface SaleTableProps {
  sales: SaleSummary[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function SaleTable({
  sales,
  isLoading,
  error,
  onRetry,
}: SaleTableProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");

  const filtered = React.useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id-ID");
    return sales.filter((sale) => {
      const matchesSearch =
        !query ||
        sale.saleNumber.toLocaleLowerCase("id-ID").includes(query) ||
        sale.customerName.toLocaleLowerCase("id-ID").includes(query);
      const saleDate = sale.saleDate.slice(0, 10);
      const matchesDate =
        (!dateFrom || saleDate >= dateFrom) &&
        (!dateTo || saleDate <= dateTo);
      const matchesStatus = status === "all" || sale.paymentStatus === status;
      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [dateFrom, dateTo, sales, search, status]);

  function openSale(id: string) {
    router.push(`/penjualan/${encodeURIComponent(id)}`);
  }

  function handleRowKeyDown(
    event: React.KeyboardEvent<HTMLTableRowElement>,
    id: string,
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openSale(id);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_auto_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Cari nomor invoice atau pelanggan"
            placeholder="Cari invoice atau pelanggan..."
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
        <label className="relative">
          <span className="sr-only">Filter status pembayaran</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
            className="h-9 w-full appearance-none rounded-md border border-input bg-background px-3 pr-9 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Filter status pembayaran"
          >
            {(Object.keys(STATUS_LABELS) as StatusFilter[]).map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </label>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomor Invoice</TableHead>
              <TableHead>Tanggal Penjualan</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead className="text-right">Total Penjualan</TableHead>
              <TableHead className="text-right">Total Dibayar</TableHead>
              <TableHead className="text-right">Sisa Tagihan</TableHead>
              <TableHead>Status Pembayaran</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 7 }).map((__, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading && error && (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <AlertCircle className="size-8 text-destructive" />
                    <div>
                      <p className="text-sm font-medium">
                        Gagal memuat penjualan
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

            {!isLoading && !error && sales.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <PackageOpen className="size-8 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Belum ada penjualan</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Transaksi penjualan yang tercatat akan tampil di sini.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !error && sales.length > 0 && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="flex flex-col items-center gap-2 py-10 text-center">
                    <Search className="size-7 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      Penjualan tidak ditemukan
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ubah kata kunci atau filter yang digunakan.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              !error &&
              filtered.map((sale) => (
                <TableRow
                  key={sale.id}
                  role="link"
                  tabIndex={0}
                  aria-label={`Buka detail penjualan ${sale.saleNumber}`}
                  className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => openSale(sale.id)}
                  onKeyDown={(event) => handleRowKeyDown(event, sale.id)}
                >
                  <TableCell className="font-mono text-xs font-medium">
                    {sale.saleNumber}
                  </TableCell>
                  <TableCell>{formatDate(sale.saleDate)}</TableCell>
                  <TableCell>
                    <span className="font-medium">{sale.customerName}</span>
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      {sale.customerCode}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRupiah(sale.totalAmount)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRupiah(sale.totalPaid)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRupiah(sale.outstandingAmount)}
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={sale.paymentStatus} />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      {!isLoading && !error && sales.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Menampilkan {filtered.length} dari {sales.length} transaksi
        </p>
      )}
    </div>
  );
}
