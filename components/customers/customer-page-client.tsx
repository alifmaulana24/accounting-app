"use client";

import * as React from "react";
import { CustomerAddDialog } from "@/components/customers/customer-add-dialog";
import { CustomerTable } from "@/components/customers/customer-table";
import { CustomerDetailDialog } from "@/components/customers/customer-detail-dialog";
import { CustomerEditDialog } from "@/components/customers/customer-edit-dialog";
import { CustomerDeleteDialog } from "@/components/customers/customer-delete-dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "cn";
import type { Customer, GetCustomersResponse } from "@/types/customer";

// ---------------------------------------------------------------------------
// Notification state
// ---------------------------------------------------------------------------

interface NotificationState {
  type: "success" | "error";
  message: string;
}

// ---------------------------------------------------------------------------
// Customer Page Client
// ---------------------------------------------------------------------------

export function CustomerPageClient() {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Detail dialog state
  const [customerForDetail, setCustomerForDetail] =
    React.useState<Customer | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  // Edit dialog state
  const [customerToEdit, setCustomerToEdit] = React.useState<Customer | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  // Delete dialog state
  const [customerToDelete, setCustomerToDelete] =
    React.useState<Customer | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  // Notification state
  const [notification, setNotification] =
    React.useState<NotificationState | null>(null);

  async function fetchCustomers() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/customers");
      const json: GetCustomersResponse = await res.json();
      if (json.success) {
        setCustomers(json.data);
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
    fetchCustomers();
  }, []);

  // Auto-dismiss notification after 5 seconds
  React.useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification]);

  function handleCustomerAdded(customer: Customer) {
    setCustomers((prev) =>
      [...prev, customer].sort((a, b) => a.name.localeCompare(b.name))
    );
    setNotification({
      type: "success",
      message: `Customer "${customer.name}" (${customer.customerCode}) berhasil ditambahkan.`,
    });
  }

  function handleRequestDetail(customer: Customer) {
    setCustomerForDetail(customer);
    setIsDetailOpen(true);
  }

  function handleRequestEdit(customer: Customer) {
    setCustomerToEdit(customer);
    setIsEditDialogOpen(true);
  }

  function handleCustomerUpdated(updated: Customer) {
    setCustomers((prev) =>
      prev
        .map((c) => (c.customerCode === updated.customerCode ? updated : c))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
    setNotification({
      type: "success",
      message: `Customer "${updated.name}" (${updated.customerCode}) berhasil diperbarui.`,
    });
  }

  function handleRequestDelete(customer: Customer) {
    setCustomerToDelete(customer);
    setIsDeleteDialogOpen(true);
  }

  function handleDeleteSuccess(deleted: Customer) {
    setCustomers((prev) =>
      prev.filter((c) => c.customerCode !== deleted.customerCode)
    );
    setNotification({
      type: "success",
      message: `Customer "${deleted.name}" (${deleted.customerCode}) berhasil dihapus.`,
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
            Master Customer
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola data pelanggan yang digunakan dalam transaksi penjualan.
          </p>
        </div>
        <div className="mt-3 sm:mt-0 shrink-0">
          <CustomerAddDialog onCustomerAdded={handleCustomerAdded} />
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
      <CustomerTable
        customers={customers}
        isLoading={isLoading}
        error={error}
        onRetry={fetchCustomers}
        onRequestDetail={handleRequestDetail}
        onRequestEdit={handleRequestEdit}
        onRequestDelete={handleRequestDelete}
      />

      {/* Detail dialog */}
      <CustomerDetailDialog
        customer={customerForDetail}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      {/* Edit dialog */}
      <CustomerEditDialog
        customer={customerToEdit}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onCustomerUpdated={handleCustomerUpdated}
      />

      {/* Delete confirmation dialog */}
      <CustomerDeleteDialog
        customer={customerToDelete}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
        onError={handleDeleteError}
      />
    </div>
  );
}

