"use client";

import * as React from "react";
import { AccountDialog } from "@/components/accounts/account-dialog";
import { AccountTable } from "@/components/accounts/account-table";
import { AccountEditDialog } from "@/components/accounts/account-edit-dialog";
import { AccountDeleteDialog } from "@/components/accounts/account-delete-dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "cn";
import type { Account, GetAccountsResponse } from "@/types/account";

interface NotificationState {
  type: "success" | "error";
  message: string;
}

export function AccountPageClient() {
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Edit dialog state
  const [accountToEdit, setAccountToEdit] = React.useState<Account | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  // Delete dialog state
  const [accountToDelete, setAccountToDelete] = React.useState<Account | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  // Notification state
  const [notification, setNotification] = React.useState<NotificationState | null>(null);

  async function fetchAccounts(): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/accounts", { cache: "no-store" });
      const json: GetAccountsResponse = await res.json();

      // Respons aktual GET: { data } saat sukses, { error } saat gagal
      if (res.ok && "data" in json && Array.isArray(json.data)) {
        setAccounts(json.data);
        return true;
      } else {
        setError("error" in json ? json.error : "Gagal mengambil data akun");
        return false;
      }
    } catch {
      setError("Gagal terhubung ke server. Silakan coba lagi.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    void fetchAccounts();
  }, []);

  // Auto-dismiss notification after 5 seconds
  React.useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification]);

  async function handleAccountAdded(_account: Account, message: string) {
    const refreshed = await fetchAccounts();
    setNotification({
      type: refreshed ? "success" : "error",
      message: refreshed ? message : `${message}. Data tabel gagal dimuat kembali.`,
    });
  }

  function handleRequestEdit(account: Account) {
    setAccountToEdit(account);
    setIsEditDialogOpen(true);
  }

  async function handleAccountUpdated(_updated: Account, message: string) {
    const refreshed = await fetchAccounts();
    setNotification({
      type: refreshed ? "success" : "error",
      message: refreshed ? message : `${message}. Data tabel gagal dimuat kembali.`,
    });
  }

  function handleRequestDelete(account: Account) {
    setAccountToDelete(account);
    setIsDeleteDialogOpen(true);
  }

  async function handleDeleteSuccess(_deletedAccount: Account, message: string) {
    const refreshed = await fetchAccounts();
    setNotification({
      type: refreshed ? "success" : "error",
      message: refreshed ? message : `${message}. Data tabel gagal dimuat kembali.`,
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
            Daftar Akun
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola Chart of Accounts (COA).
          </p>
        </div>
        <div className="mt-3 sm:mt-0 shrink-0">
          <AccountDialog onAccountAdded={handleAccountAdded} />
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
      <AccountTable
        accounts={accounts}
        isLoading={isLoading}
        error={error}
        onRetry={fetchAccounts}
        onRequestEdit={handleRequestEdit}
        onRequestDelete={handleRequestDelete}
      />

      {/* Edit dialog */}
      <AccountEditDialog
        account={accountToEdit}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onAccountUpdated={handleAccountUpdated}
      />

      {/* Delete confirmation dialog */}
      <AccountDeleteDialog
        account={accountToDelete}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
        onError={handleDeleteError}
      />
    </div>
  );
}
