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
import type { Supplier, DeleteSupplierResponse } from "@/types/supplier";

interface SupplierDeleteDialogProps {
  supplier: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (deletedSupplier: Supplier) => void;
  onError: (errorMessage: string) => void;
}

export function SupplierDeleteDialog({
  supplier,
  open,
  onOpenChange,
  onSuccess,
  onError,
}: SupplierDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!supplier) return null;

  async function handleDelete() {
    if (!supplier) return;
    setIsDeleting(true);

    try {
      const res = await fetch(
        `/api/suppliers/${encodeURIComponent(supplier.supplierCode)}`,
        {
          method: "DELETE",
        }
      );

      const json: DeleteSupplierResponse = await res.json();

      if (json.success) {
        onSuccess(supplier);
        onOpenChange(false);
      } else {
        onError(json.message || "Gagal menghapus supplier.");
        onOpenChange(false);
      }
    } catch {
      onError("Terjadi kesalahan koneksi saat menghapus supplier.");
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Supplier?</AlertDialogTitle>
          <AlertDialogDescription className="flex flex-col gap-3">
            <span>
              Apakah Anda yakin ingin menghapus supplier ini? Tindakan ini tidak
              dapat dibatalkan.
            </span>
            <span className="rounded-lg border border-border bg-muted/50 p-3 text-left">
              <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Detail Supplier:
              </span>
              <span className="mt-1 block text-sm font-medium text-foreground">
                {supplier.name}
              </span>
              <span className="block font-mono text-xs text-muted-foreground">
                Kode: {supplier.supplierCode}
              </span>
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
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
