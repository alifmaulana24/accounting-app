"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogCloseButton,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  CreateSalePaymentResponse,
  DeleteSaleResponse,
  GetSaleDetailResponse,
  SaleApiErrorResponse,
  SaleDetail,
  SalePaymentStatus,
} from "@/types/sale";

interface SaleDetailClientProps {
  saleId: string;
}

interface NotificationState {
  type: "success" | "error";
  message: string;
}

function getLocalDate() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

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
    month: "long",
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

export function SaleDetailClient({ saleId }: SaleDetailClientProps) {
  const router = useRouter();
  const [sale, setSale] = React.useState<SaleDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [pageError, setPageError] = React.useState<string | null>(null);
  const [notification, setNotification] =
    React.useState<NotificationState | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false);
  const [paymentDate, setPaymentDate] = React.useState(getLocalDate);
  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [paymentError, setPaymentError] = React.useState<string | null>(null);
  const [isAddingPayment, setIsAddingPayment] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchSale = React.useCallback(async () => {
    setIsLoading(true);
    setPageError(null);
    try {
      const response = await fetch(
        `/api/sales/${encodeURIComponent(saleId)}`,
        { cache: "no-store" },
      );
      const json: GetSaleDetailResponse | SaleApiErrorResponse =
        await response.json();

      if (!response.ok || !("data" in json)) {
        setPageError(
          "message" in json
            ? json.message
            : "Gagal memuat detail penjualan.",
        );
        setSale(null);
        return;
      }

      setSale(json.data);
    } catch {
      setPageError("Gagal terhubung ke server. Silakan coba lagi.");
      setSale(null);
    } finally {
      setIsLoading(false);
    }
  }, [saleId]);

  React.useEffect(() => {
    void Promise.resolve().then(fetchSale);
  }, [fetchSale]);

  React.useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 5000);
    return () => clearTimeout(timer);
  }, [notification]);

  async function handleAddPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPaymentError(null);

    const amount = Number(paymentAmount);
    if (!paymentDate) {
      setPaymentError("Tanggal pembayaran wajib diisi.");
      return;
    }
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      setPaymentError("Nominal pembayaran harus bilangan bulat lebih dari Rp0.");
      return;
    }
    if (sale && amount > Number(sale.outstandingAmount)) {
      setPaymentError("Nominal pembayaran tidak boleh melebihi sisa tagihan.");
      return;
    }

    setIsAddingPayment(true);
    try {
      const response = await fetch(
        `/api/sales/${encodeURIComponent(saleId)}/payments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentDate, amount }),
        },
      );
      const json: CreateSalePaymentResponse | SaleApiErrorResponse =
        await response.json();

      if (!response.ok || !("data" in json)) {
        setPaymentError(
          "message" in json
            ? json.message
            : "Gagal menambahkan pembayaran.",
        );
        return;
      }

      setIsPaymentDialogOpen(false);
      setPaymentAmount("");
      setPaymentDate(getLocalDate());
      setNotification({
        type: "success",
        message: "Pembayaran berhasil ditambahkan.",
      });
      await fetchSale();
    } catch {
      setPaymentError("Gagal terhubung ke server. Silakan coba lagi.");
    } finally {
      setIsAddingPayment(false);
    }
  }

  async function handleDeleteSale() {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/sales/${encodeURIComponent(saleId)}`,
        { method: "DELETE" },
      );
      const json: DeleteSaleResponse | SaleApiErrorResponse =
        await response.json();

      if (!response.ok) {
        setNotification({
          type: "error",
          message:
            "message" in json
              ? json.message
              : "Gagal menghapus transaksi penjualan.",
        });
        setIsDeleteDialogOpen(false);
        await fetchSale();
        return;
      }

      router.push("/penjualan?deleted=1");
    } catch {
      setNotification({
        type: "error",
        message: "Gagal terhubung ke server saat menghapus penjualan.",
      });
      setIsDeleteDialogOpen(false);
      await fetchSale();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button
            nativeButton={false}
            variant="outline"
            size="icon"
            render={<Link href="/penjualan" />}
            aria-label="Kembali ke daftar penjualan"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <p className="text-sm text-muted-foreground">Detail Penjualan</p>
            <h1 className="mt-0.5 break-all text-2xl font-bold tracking-tight text-foreground">
              {sale?.saleNumber ?? "Transaksi"}
            </h1>
            {sale && (
              <p className="mt-1 text-sm text-muted-foreground">
                Tanggal penjualan {formatDate(sale.saleDate)}
              </p>
            )}
          </div>
        </div>
        {sale && (
          <div className="flex flex-wrap gap-2 sm:justify-end">
            {sale.paymentStatus !== "Lunas" &&
              Number(sale.outstandingAmount) > 0 && (
                <Button
                  onClick={() => {
                    setPaymentError(null);
                    setPaymentAmount("");
                    setPaymentDate(getLocalDate());
                    setIsPaymentDialogOpen(true);
                  }}
                  className="gap-1.5"
                >
                  <Plus className="size-4" />
                  Tambah Pembayaran
                </Button>
              )}
            {sale.paymentStatus === "Belum Dibayar" && (
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="gap-1.5"
              >
                <Trash2 className="size-4" />
                Hapus Transaksi
              </Button>
            )}
          </div>
        )}
      </div>

      {notification && (
        <div
          role={notification.type === "error" ? "alert" : "status"}
          className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
            notification.type === "success"
              ? "border-emerald-500/20 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-200"
              : "border-destructive/20 bg-destructive/10 text-destructive"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === "success" ? (
              <CheckCircle2 className="size-4 shrink-0" />
            ) : (
              <AlertCircle className="size-4 shrink-0" />
            )}
            <p className="font-medium">{notification.message}</p>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setNotification(null)}
            aria-label="Tutup notifikasi"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Memuat detail penjualan...
        </div>
      ) : pageError ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-8 text-center">
          <AlertCircle className="size-8 text-destructive" />
          <div>
            <p className="text-sm font-medium">
              Gagal memuat detail penjualan
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{pageError}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void fetchSale()}>
            Coba Lagi
          </Button>
        </div>
      ) : sale ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-medium text-muted-foreground">
                Pelanggan
              </h2>
              <p className="mt-2 text-lg font-semibold">{sale.customerName}</p>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                {sale.customerCode}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-medium text-muted-foreground">
                Status Pembayaran
              </h2>
              <div className="mt-2">
                <PaymentStatusBadge status={sale.paymentStatus} />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold">Produk yang Dijual</h2>
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produk</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Kuantitas</TableHead>
                    <TableHead>Satuan</TableHead>
                    <TableHead className="text-right">Harga Jual</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sale.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.productName}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {item.productSku}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {item.quantity}
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatRupiah(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatRupiah(item.subtotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold">Ringkasan Pembayaran</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-muted/50 p-4">
                <dt className="text-sm text-muted-foreground">
                  Total Penjualan
                </dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums">
                  {formatRupiah(sale.totalAmount)}
                </dd>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <dt className="text-sm text-muted-foreground">Total Dibayar</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums">
                  {formatRupiah(sale.totalPaid)}
                </dd>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <dt className="text-sm text-muted-foreground">Sisa Tagihan</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums">
                  {formatRupiah(sale.outstandingAmount)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold">Riwayat Pembayaran</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {sale.payments.length} pembayaran tercatat.
            </p>
            {sale.payments.length === 0 ? (
              <p className="mt-4 rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
                Belum ada pembayaran untuk transaksi ini.
              </p>
            ) : (
              <div className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal Pembayaran</TableHead>
                      <TableHead className="text-right">Nominal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sale.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {formatRupiah(payment.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>
        </>
      ) : null}

      <Dialog
        open={isPaymentDialogOpen}
        onOpenChange={(open) => {
          if (!isAddingPayment) setIsPaymentDialogOpen(open);
        }}
      >
        <DialogPopup>
          <DialogCloseButton disabled={isAddingPayment} />
          <DialogHeader className="mb-4">
            <DialogTitle>Tambah Pembayaran</DialogTitle>
            <DialogDescription>
              Catat pembayaran untuk invoice{" "}
              <span className="font-medium text-foreground">
                {sale?.saleNumber}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPayment} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Tanggal Pembayaran
              <Input
                type="date"
                value={paymentDate}
                onChange={(event) => {
                  setPaymentDate(event.target.value);
                  setPaymentError(null);
                }}
                disabled={isAddingPayment}
                required
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Nominal Pembayaran
              <Input
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={paymentAmount}
                onChange={(event) => {
                  setPaymentAmount(event.target.value);
                  setPaymentError(null);
                }}
                disabled={isAddingPayment}
                placeholder="Contoh: 100000"
                required
              />
            </label>
            {sale && (
              <p className="text-xs text-muted-foreground">
                Sisa tagihan: {formatRupiah(sale.outstandingAmount)}
              </p>
            )}
            {paymentError && (
              <p
                role="alert"
                className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {paymentError}
              </p>
            )}
            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPaymentDialogOpen(false)}
                disabled={isAddingPayment}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isAddingPayment}
                className="gap-1.5"
              >
                {isAddingPayment && <Loader2 className="size-4 animate-spin" />}
                {isAddingPayment ? "Menyimpan..." : "Simpan Pembayaran"}
              </Button>
            </DialogFooter>
          </form>
        </DialogPopup>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!isDeleting) setIsDeleteDialogOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Transaksi Penjualan?</AlertDialogTitle>
            <AlertDialogDescription>
              Transaksi {sale?.saleNumber} akan dihapus permanen. Backend akan
              menolak penghapusan jika transaksi memiliki riwayat pembayaran.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => void handleDeleteSale()}
              disabled={isDeleting}
              className="gap-1.5"
            >
              {isDeleting && <Loader2 className="size-4 animate-spin" />}
              {isDeleting ? "Menghapus..." : "Hapus Transaksi"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
