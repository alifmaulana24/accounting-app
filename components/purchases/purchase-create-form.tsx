"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product, GetProductsResponse } from "@/types/product";
import type { GetSuppliersResponse, Supplier } from "@/types/supplier";
import type {
  ApiErrorResponse,
  CreatePurchaseResponse,
} from "@/types/purchase";

interface PurchaseLine {
  id: number;
  productSku: string;
  quantity: string;
  unitPrice: string;
}

function getLocalDate() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function PurchaseCreateForm() {
  const router = useRouter();
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoadingReferences, setIsLoadingReferences] = React.useState(true);
  const [referenceError, setReferenceError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [purchaseDate, setPurchaseDate] = React.useState(getLocalDate);
  const [supplierCode, setSupplierCode] = React.useState("");
  const [initialPayment, setInitialPayment] = React.useState("0");
  const [lines, setLines] = React.useState<PurchaseLine[]>([
    { id: 1, productSku: "", quantity: "1", unitPrice: "" },
  ]);
  const [nextLineId, setNextLineId] = React.useState(2);

  const loadReferences = React.useCallback(async () => {
    setIsLoadingReferences(true);
    setReferenceError(null);
    try {
      const [supplierResponse, productResponse] = await Promise.all([
        fetch("/api/suppliers", { cache: "no-store" }),
        fetch("/api/products", { cache: "no-store" }),
      ]);
      const [supplierJson, productJson]: [
        GetSuppliersResponse | ApiErrorResponse,
        GetProductsResponse | ApiErrorResponse,
      ] = await Promise.all([supplierResponse.json(), productResponse.json()]);

      if (!supplierResponse.ok || !supplierJson.success) {
        throw new Error(
          supplierJson.success
            ? "Gagal memuat data supplier."
            : supplierJson.message,
        );
      }
      if (!productResponse.ok || !productJson.success) {
        throw new Error(
          productJson.success
            ? "Gagal memuat data produk."
            : productJson.message,
        );
      }

      setSuppliers(supplierJson.data.filter((supplier) => supplier.isActive));
      setProducts(productJson.data.filter((product) => product.isActive));
    } catch (error) {
      setReferenceError(
        error instanceof Error
          ? error.message
          : "Gagal memuat supplier dan produk.",
      );
    } finally {
      setIsLoadingReferences(false);
    }
  }, []);

  React.useEffect(() => {
    void Promise.resolve().then(loadReferences);
  }, [loadReferences]);

  const totalAmount = lines.reduce((total, line) => {
    const quantity = Number(line.quantity);
    const unitPrice = Number(line.unitPrice);
    if (
      Number.isSafeInteger(quantity) &&
      quantity > 0 &&
      Number.isSafeInteger(unitPrice) &&
      unitPrice >= 0
    ) {
      return total + quantity * unitPrice;
    }
    return total;
  }, 0);

  function updateLine(id: number, patch: Partial<PurchaseLine>) {
    setLines((current) =>
      current.map((line) => (line.id === id ? { ...line, ...patch } : line)),
    );
    setServerError(null);
  }

  function addLine() {
    setLines((current) => [
      ...current,
      { id: nextLineId, productSku: "", quantity: "1", unitPrice: "" },
    ]);
    setNextLineId((current) => current + 1);
  }

  function removeLine(id: number) {
    setLines((current) => current.filter((line) => line.id !== id));
    setServerError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    if (!purchaseDate) {
      setServerError("Tanggal pembelian wajib diisi.");
      return;
    }
    if (!supplierCode) {
      setServerError("Supplier aktif wajib dipilih.");
      return;
    }
    if (lines.length === 0 || lines.some((line) => !line.productSku)) {
      setServerError("Pilih produk untuk setiap baris pembelian.");
      return;
    }

    const productSkus = lines.map((line) => line.productSku);
    if (new Set(productSkus).size !== productSkus.length) {
      setServerError("Produk yang sama tidak boleh dimasukkan dua kali.");
      return;
    }

    const items = lines.map((line) => ({
      productSku: line.productSku,
      quantity: Number(line.quantity),
      unitPrice: Number(line.unitPrice),
    }));
    if (
      items.some(
        (item) =>
          !Number.isSafeInteger(item.quantity) ||
          item.quantity <= 0 ||
          !Number.isSafeInteger(item.unitPrice) ||
          item.unitPrice < 0,
      )
    ) {
      setServerError(
        "Kuantitas harus bilangan bulat lebih dari 0 dan harga beli bilangan bulat minimal Rp0.",
      );
      return;
    }

    const total = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    const payment = initialPayment.trim() === "" ? 0 : Number(initialPayment);
    if (
      !Number.isSafeInteger(total) ||
      !Number.isSafeInteger(payment) ||
      payment < 0
    ) {
      setServerError("Total dan pembayaran harus berupa bilangan bulat Rupiah.");
      return;
    }
    if (payment > total) {
      setServerError("Pembayaran awal tidak boleh melebihi total pembelian.");
      return;
    }

    setIsPending(true);
    try {
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchaseDate,
          supplierCode,
          items,
          initialPayment: payment,
        }),
      });
      const json: CreatePurchaseResponse | ApiErrorResponse =
        await response.json();

      if (!response.ok || !json.success) {
        setServerError(
          json.success ? "Gagal menambahkan pembelian." : json.message,
        );
        return;
      }

      router.push(
        `/pembelian/${encodeURIComponent(json.data.id)}?created=1`,
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
          render={<Link href="/pembelian" />}
          aria-label="Kembali ke daftar pembelian"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Tambah Pembelian
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Catat barang yang diterima dan pembayaran awal jika ada.
          </p>
        </div>
      </div>

      {referenceError ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-5">
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>{referenceError}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadReferences()}
            className="mt-3"
          >
            Coba Lagi
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold">Informasi Pembelian</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Tanggal Pembelian
                <Input
                  type="date"
                  value={purchaseDate}
                  onChange={(event) => setPurchaseDate(event.target.value)}
                  disabled={isPending || isLoadingReferences}
                  required
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Supplier
                <select
                  value={supplierCode}
                  onChange={(event) => setSupplierCode(event.target.value)}
                  disabled={isPending || isLoadingReferences}
                  required
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    {isLoadingReferences
                      ? "Memuat supplier..."
                      : "Pilih supplier aktif"}
                  </option>
                  {suppliers.map((supplier) => (
                    <option
                      key={supplier.supplierCode}
                      value={supplier.supplierCode}
                    >
                      {supplier.name} ({supplier.supplierCode})
                    </option>
                  ))}
                </select>
                {!isLoadingReferences && suppliers.length === 0 && (
                  <span className="text-xs font-normal text-muted-foreground">
                    Belum ada supplier aktif.
                  </span>
                )}
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold">Produk Pembelian</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pilih produk aktif, lalu masukkan kuantitas dan harga beli.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLine}
                disabled={
                  isPending ||
                  isLoadingReferences ||
                  products.length === 0 ||
                  lines.length >= products.length
                }
                className="gap-1.5"
              >
                <Plus className="size-4" />
                Tambah Produk
              </Button>
            </div>

            {isLoadingReferences ? (
              <p className="mt-5 text-sm text-muted-foreground">
                Memuat daftar produk...
              </p>
            ) : products.length === 0 ? (
              <p className="mt-5 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Belum ada produk aktif yang dapat dipilih.
              </p>
            ) : (
              <div className="mt-5 flex flex-col gap-4">
                {lines.map((line, index) => {
                  const selectedProduct = products.find(
                    (product) => product.sku === line.productSku,
                  );
                  const quantity = Number(line.quantity);
                  const unitPrice = Number(line.unitPrice);
                  const subtotal =
                    Number.isSafeInteger(quantity) &&
                    quantity > 0 &&
                    Number.isSafeInteger(unitPrice) &&
                    unitPrice >= 0
                      ? quantity * unitPrice
                      : 0;

                  return (
                    <div
                      key={line.id}
                      className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,2fr)_minmax(100px,0.8fr)_minmax(140px,1fr)_minmax(150px,1fr)_auto] lg:items-end"
                    >
                      <label className="flex flex-col gap-1.5 text-sm font-medium">
                        Produk
                        <select
                          value={line.productSku}
                          onChange={(event) =>
                            updateLine(line.id, {
                              productSku: event.target.value,
                            })
                          }
                          disabled={isPending}
                          required
                          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-normal shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                        >
                          <option value="">Pilih produk</option>
                          {products.map((product) => {
                            const selectedElsewhere = lines.some(
                              (otherLine) =>
                                otherLine.id !== line.id &&
                                otherLine.productSku === product.sku,
                            );
                            return (
                              <option
                                key={product.sku}
                                value={product.sku}
                                disabled={selectedElsewhere}
                              >
                                {product.name} ({product.sku})
                              </option>
                            );
                          })}
                        </select>
                        {selectedProduct && (
                          <span className="text-xs font-normal text-muted-foreground">
                            Satuan: {selectedProduct.unit}
                          </span>
                        )}
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm font-medium">
                        Kuantitas
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          inputMode="numeric"
                          value={line.quantity}
                          onChange={(event) =>
                            updateLine(line.id, { quantity: event.target.value })
                          }
                          disabled={isPending}
                          required
                        />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm font-medium">
                        Harga Beli / Unit
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          inputMode="numeric"
                          value={line.unitPrice}
                          onChange={(event) =>
                            updateLine(line.id, { unitPrice: event.target.value })
                          }
                          disabled={isPending}
                          placeholder="0"
                          required
                        />
                      </label>
                      <div className="flex flex-col gap-1.5 text-sm">
                        <span className="font-medium">Subtotal</span>
                        <div className="flex h-9 items-center">
                          <span className="font-medium tabular-nums">
                            {formatRupiah(subtotal)}
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLine(line.id)}
                        disabled={isPending || lines.length === 1}
                        aria-label={`Hapus produk baris ${index + 1}`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold">Ringkasan Pembayaran</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Pembayaran Awal (Opsional)
                <Input
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={initialPayment}
                  onChange={(event) => {
                    setInitialPayment(event.target.value);
                    setServerError(null);
                  }}
                  disabled={isPending}
                  placeholder="0"
                />
                <span className="text-xs font-normal text-muted-foreground">
                  Masukkan bilangan bulat Rupiah. Default Rp0.
                </span>
              </label>
              <div className="flex flex-col justify-center gap-2 rounded-lg bg-muted/50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    Total Pembelian
                  </span>
                  <span className="text-lg font-semibold tabular-nums">
                    {formatRupiah(totalAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    Pembayaran Awal
                  </span>
                  <Badge variant="secondary">
                    {formatRupiah(Number(initialPayment) || 0)}
                  </Badge>
                </div>
              </div>
            </div>
          </section>

          {serverError && (
            <p
              role="alert"
              className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {serverError}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              nativeButton={false}
              variant="outline"
              render={<Link href="/pembelian" />}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={
                isPending ||
                isLoadingReferences ||
                !!referenceError ||
                suppliers.length === 0 ||
                products.length === 0
              }
              className="gap-1.5"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isPending ? "Menyimpan..." : "Simpan Pembelian"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
