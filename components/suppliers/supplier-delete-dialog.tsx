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
import type { Supplier } from "@/types/supplier";

interface SupplierDeleteDialogProps {
  supplier: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (supplier: Supplier) => void;
}

export function SupplierDeleteDialog({
  supplier,
  open,
  onOpenChange,
  onConfirm,
}: SupplierDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!supplier) return null;

  async function handleDelete() {
    if (!supplier) return;
    setIsDeleting(true);
    // Simulate async (replace with API call later)
    await new Promise((resolve) => setTimeout(resolve, 400));
    setIsDeleting(false);
    onConfirm(supplier);
    onOpenChange(false);
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

