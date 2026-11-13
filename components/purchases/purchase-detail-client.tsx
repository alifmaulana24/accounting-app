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
  ApiErrorResponse,
  CreatePurchasePaymentResponse,
  GetPurchaseDetailResponse,
  PurchaseDetail,
  PurchasePaymentStatus,
} from "@/types/purchase";

interface PurchaseDetailClientProps {
  purchaseId: string;
  showCreatedNotice: boolean;
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

function PaymentStatusBadge({ status }: { status: PurchasePaymentStatus }) {
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

export function PurchaseDetailClient({
  purchaseId,
  showCreatedNotice,
}: PurchaseDetailClientProps) {
  const router = useRouter();
  const [purchase, setPurchase] = React.useState<PurchaseDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [pageError, setPageError] = React.useState<string | null>(null);
  const [notification, setNotification] =
    React.useState<NotificationState | null>(
      showCreatedNotice
        ? {
            type: "success",
            message: "Pembelian berhasil dibuat.",
          }
        : null,
    );
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false);
  const [paymentDate, setPaymentDate] = React.useState(getLocalDate);
  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [paymentError, setPaymentError] = React.useState<string | null>(null);
  const [isAddingPayment, setIsAddingPayment] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchPurchase = React.useCallback(async () => {
    setIsLoading(true);
    setPageError(null);
    try {
      const response = await fetch(
        `/api/purchases/${encodeURIComponent(purchaseId)}`,
        { cache: "no-store" },
      );
      const json: GetPurchaseDetailResponse | ApiErrorResponse =
        await response.json();

      if (!response.ok || !json.success) {
        setPageError(
          json.success ? "Gagal memuat detail pembelian." : json.message,
        );
        setPurchase(null);
        return;
      }

      setPurchase(json.data);
    } catch {
      setPageError("Gagal terhubung ke server. Silakan coba lagi.");
      setPurchase(null);
    } finally {
      setIsLoading(false);
    }
  }, [purchaseId]);

  React.useEffect(() => {
    void Promise.resolve().then(fetchPurchase);
  }, [fetchPurchase]);

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

    setIsAddingPayment(true);
    try {
      const response = await fetch(
        `/api/purchases/${encodeURIComponent(purchaseId)}/payments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentDate, amount }),
        },
      );
      const json: CreatePurchasePaymentResponse | ApiErrorResponse =
        await response.json();

      if (!response.ok || !json.success) {
        setPaymentError(
          json.success ? "Gagal menambahkan pembayaran." : json.message,
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
      await fetchPurchase();
    } catch {
      setPaymentError("Gagal terhubung ke server. Silakan coba lagi.");
    } finally {
      setIsAddingPayment(false);
    }
  }

  async function handleDeletePurchase() {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/purchases/${encodeURIComponent(purchaseId)}`,
        { method: "DELETE" },
      );
      const json: { success: boolean; message: string } =
        await response.json();

      if (!response.ok || !json.success) {
        setNotification({
          type: "error",
          message: json.message || "Gagal menghapus pembelian.",
        });
        setIsDeleteDialogOpen(false);
        await fetchPurchase();
        return;
      }

      router.push("/pembelian?deleted=1");
    } catch {
      setNotification({
        type: "error",
        message: "Gagal terhubung ke server saat menghapus pembelian.",
      });
      setIsDeleteDialogOpen(false);
      await fetchPurchase();
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
            render={<Link href="/pembelian" />}
            aria-label="Kembali ke daftar pembelian"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <p className="text-sm text-muted-foreground">Detail Pembelian</p>
            <h1 className="mt-0.5 break-all text-2xl font-bold tracking-tight text-foreground">
              {purchase?.purchaseNumber ?? "Transaksi"}
            </h1>
            {purchase && (
              <p className="mt-1 text-sm text-muted-foreground">
                Tanggal pembelian {formatDate(purchase.purchaseDate)}
              </p>
            )}
          </div>
        </div>
        {purchase && (
          <div className="flex flex-wrap gap-2 sm:justify-end">
            {Number(purchase.outstandingAmount) > 0 && (
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
            {purchase.payments.length === 0 && (
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
          Memuat detail pembelian...
        </div>
      ) : pageError ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-8 text-center">
          <AlertCircle className="size-8 text-destructive" />
          <div>
            <p className="text-sm font-medium">Gagal memuat detail pembelian</p>
            <p className="mt-1 text-sm text-muted-foreground">{pageError}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void fetchPurchase()}>
            Coba Lagi
          </Button>
        </div>
      ) : purchase ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-medium text-muted-foreground">
                Supplier
              </h2>
              <p className="mt-2 text-lg font-semibold">{purchase.supplierName}</p>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                {purchase.supplierCode}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-medium text-muted-foreground">
                Status Pembayaran
              </h2>
              <div className="mt-2">
                <PaymentStatusBadge status={purchase.paymentStatus} />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold">Produk yang Dibeli</h2>
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produk</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Kuantitas</TableHead>
                    <TableHead>Satuan</TableHead>
                    <TableHead className="text-right">Harga Beli</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchase.items.map((item) => (
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
                <dt className="text-sm text-muted-foreground">Total Pembelian</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums">
                  {formatRupiah(purchase.totalAmount)}
                </dd>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <dt className="text-sm text-muted-foreground">Total Dibayar</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums">
                  {formatRupiah(purchase.totalPaid)}
                </dd>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <dt className="text-sm text-muted-foreground">Sisa Tagihan</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums">
                  {formatRupiah(purchase.outstandingAmount)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-base font-semibold">Riwayat Pembayaran</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {purchase.payments.length} pembayaran tercatat.
                </p>
              </div>
            </div>
            {purchase.payments.length === 0 ? (
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
                    {purchase.payments.map((payment) => (
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
                {purchase?.purchaseNumber}
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
            {purchase && (
              <p className="text-xs text-muted-foreground">
                Sisa tagihan: {formatRupiah(purchase.outstandingAmount)}
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
            <AlertDialogTitle>Hapus Transaksi Pembelian?</AlertDialogTitle>
            <AlertDialogDescription>
              Transaksi {purchase?.purchaseNumber} akan dihapus permanen. Tindakan
              ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => void handleDeletePurchase()}
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
