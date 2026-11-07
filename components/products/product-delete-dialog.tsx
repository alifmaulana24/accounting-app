"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Product, DeleteProductResponse } from "@/types/product";

interface ProductDeleteDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (deletedProduct: Product) => void;
  onError: (errorMessage: string) => void;
}

export function ProductDeleteDialog({
  product,
  open,
  onOpenChange,
  onSuccess,
  onError,
}: ProductDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!product) return null;

  async function handleDelete() {
    if (!product) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/products/${encodeURIComponent(product.sku)}`, {
        method: "DELETE",
      });

      const json: DeleteProductResponse = await res.json();

      if (json.success) {
        onSuccess(product);
        onOpenChange(false);
      } else {
        onError(json.message || "Gagal menghapus produk.");
        onOpenChange(false);
      }
    } catch {
      onError("Terjadi kesalahan koneksi saat menghapus produk.");
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
          <AlertDialogDescription className="flex flex-col gap-3">
            <span>
              Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.
            </span>
            <span className="rounded-lg border border-border bg-muted/50 p-3 text-left">
              <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Detail Produk:
              </span>
              <span className="mt-1 block text-sm font-medium text-foreground">
                {product.name}
              </span>
              <span className="block font-mono text-xs text-muted-foreground">
                SKU: {product.sku}
              </span>
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Batal
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-1.5"
          >
            {isDeleting && <Loader2 className="size-4 animate-spin" />}
            {isDeleting ? "Menghapus..." : "Hapus"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

