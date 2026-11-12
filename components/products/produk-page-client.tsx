"use client";

import * as React from "react";
import { ProductDialog } from "@/components/products/product-dialog";
import { ProductTable } from "@/components/products/product-table";
import { ProductEditDialog } from "@/components/products/product-edit-dialog";
import { ProductDeleteDialog } from "@/components/products/product-delete-dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "cn";
import type { GetProductsResponse, Product } from "@/types/product";

interface NotificationState {
  type: "success" | "error";
  message: string;
}

export function ProdukPageClient() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Edit dialog state
  const [productToEdit, setProductToEdit] = React.useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  // Delete dialog state
  const [productToDelete, setProductToDelete] = React.useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  // Notification state
  const [notification, setNotification] = React.useState<NotificationState | null>(null);

  async function fetchProducts() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products");
      const json: GetProductsResponse = await res.json();
      if (json.success) {
        setProducts(json.data);
      } else {
        setError(json.message);
      }
    } catch {
      setError("Gagal terhubung ke server. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    fetchProducts();
  }, []);

  // Auto-dismiss notification after 5 seconds
  React.useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification]);

  function handleProductAdded(product: Product) {
    setProducts((prev) =>
      [...prev, product].sort((a, b) => a.name.localeCompare(b.name))
    );
    setNotification({
      type: "success",
      message: `Produk "${product.name}" (${product.sku}) berhasil ditambahkan.`,
    });
  }

  function handleRequestEdit(product: Product) {
    setProductToEdit(product);
    setIsEditDialogOpen(true);
  }

  function handleProductUpdated(updated: Product) {
    setProducts((prev) =>
      prev
        .map((p) => (p.sku === updated.sku ? updated : p))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
    setNotification({
      type: "success",
      message: `Produk "${updated.name}" (${updated.sku}) berhasil diperbarui.`,
    });
  }

  function handleRequestDelete(product: Product) {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  }

  function handleDeleteSuccess(deletedProduct: Product) {
    setProducts((prev) => prev.filter((p) => p.sku !== deletedProduct.sku));
    setNotification({
      type: "success",
      message: `Produk "${deletedProduct.name}" (${deletedProduct.sku}) berhasil dihapus.`,
    });
  }

  function handleDeleteError(errorMessage: string) {
    setNotification({
      type: "error",
      message: errorMessage,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Master Produk
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola informasi dan data produk.
          </p>
        </div>
        <div className="mt-3 sm:mt-0 shrink-0">
          <ProductDialog onProductAdded={handleProductAdded} />
        </div>
      </div>

      {/* Notification banner */}
      {notification && (
        <div
          role="alert"
          className={cn(
            "flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-sm transition-all",
            notification.type === "success"
              ? "border-emerald-500/20 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-200"
              : "border-destructive/20 bg-destructive/10 text-destructive dark:border-destructive/30 dark:bg-destructive/20"
          )}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === "success" ? (
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="size-4 shrink-0 text-destructive" />
            )}
            <p className="font-medium">{notification.message}</p>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setNotification(null)}
            className="text-current hover:bg-black/5 dark:hover:bg-white/10"
            title="Tutup notifikasi"
          >
            <X className="size-3.5" />
            <span className="sr-only">Tutup</span>
          </Button>
        </div>
      )}

      {/* Table */}
      <ProductTable
        products={products}
        isLoading={isLoading}
        error={error}
        onRetry={fetchProducts}
        onRequestEdit={handleRequestEdit}
        onRequestDelete={handleRequestDelete}
      />

      {/* Edit dialog */}
      <ProductEditDialog
        product={productToEdit}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onProductUpdated={handleProductUpdated}
      />

      {/* Delete confirmation dialog */}
      <ProductDeleteDialog
        product={productToDelete}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
        onError={handleDeleteError}
      />
    </div>
  );
}
