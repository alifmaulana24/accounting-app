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
import type { Customer, DeleteCustomerResponse } from "@/types/customer";

interface CustomerDeleteDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (deletedCustomer: Customer) => void;
  onError: (errorMessage: string) => void;
}

export function CustomerDeleteDialog({
  customer,
  open,
  onOpenChange,
  onSuccess,
  onError,
}: CustomerDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!customer) return null;

  async function handleDelete() {
    if (!customer) return;
    setIsDeleting(true);

    try {
      const res = await fetch(
        `/api/customers/${encodeURIComponent(customer.customerCode)}`,
        {
          method: "DELETE",
        }
      );

      const json: DeleteCustomerResponse = await res.json();

      if (json.success) {
        onSuccess(customer);
        onOpenChange(false);
      } else {
        onError(json.message || "Gagal menghapus pelanggan.");
        onOpenChange(false);
      }
    } catch {
      onError("Terjadi kesalahan koneksi saat menghapus pelanggan.");
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Customer?</AlertDialogTitle>
          <AlertDialogDescription className="flex flex-col gap-3">
            <span>
              Apakah Anda yakin ingin menghapus pelanggan ini? Tindakan ini tidak
              dapat dibatalkan.
            </span>
            <span className="rounded-lg border border-border bg-muted/50 p-3 text-left">
              <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Detail Customer:
              </span>
              <span className="mt-1 block text-sm font-medium text-foreground">
                {customer.name}
              </span>
              <span className="block font-mono text-xs text-muted-foreground">
                Kode: {customer.customerCode}
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

