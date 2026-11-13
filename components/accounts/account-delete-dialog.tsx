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
import type { Account, DeleteAccountResponse } from "@/types/account";

interface AccountDeleteDialogProps {
  account: Account | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (deletedAccount: Account, message: string) => Promise<void>;
  onError: (errorMessage: string) => void;
}

export function AccountDeleteDialog({
  account,
  open,
  onOpenChange,
  onSuccess,
  onError,
}: AccountDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!account || account.isSystem) return null;

  async function handleDelete() {
    if (!account || account.isSystem) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/accounts/${encodeURIComponent(account.id)}`, {
        method: "DELETE",
      });

      const json: DeleteAccountResponse = await res.json();

      // Success: 200 { message }
      if (res.ok && "message" in json) {
        await onSuccess(account, json.message);
        onOpenChange(false);
      } else {
        // 403 (akun bawaan), 404, 409 (masih digunakan), 500
        onError("error" in json ? json.error : "Gagal menghapus akun.");
        onOpenChange(false);
      }
    } catch {
      onError("Terjadi kesalahan koneksi saat menghapus akun.");
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Akun?</AlertDialogTitle>
          <AlertDialogDescription className="flex flex-col gap-3">
            <span>
              Apakah Anda yakin ingin menghapus akun ini? Tindakan ini tidak dapat dibatalkan.
            </span>
            <span className="rounded-lg border border-border bg-muted/50 p-3 text-left">
              <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Detail Akun:
              </span>
              <span className="mt-1 block text-sm font-medium text-foreground">
                {account.name}
              </span>
              <span className="block font-mono text-xs text-muted-foreground">
                Kode: {account.code}
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
