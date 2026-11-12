"use client";

import * as React from "react";
import { SupplierAddDialog } from "@/components/suppliers/supplier-add-dialog";
import { SupplierTable } from "@/components/suppliers/supplier-table";
import { SupplierEditDialog } from "@/components/suppliers/supplier-edit-dialog";
import { SupplierDeleteDialog } from "@/components/suppliers/supplier-delete-dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "cn";
import type { Supplier } from "@/types/supplier";

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

const SAMPLE_SUPPLIERS: Supplier[] = [
  {
    supplierCode: "SUP-001",
    name: "PT Maju Bersama",
    phone: "021-55512345",
    email: "info@majubersama.com",
    address: "Jl. Raya Jakarta No. 10, Jakarta Pusat",
    isActive: true,
    createdAt: "2026-01-10T07:00:00.000Z",
    updatedAt: "2026-01-10T07:00:00.000Z",
  },
  {
    supplierCode: "SUP-002",
    name: "CV Sukses Mandiri",
    phone: null,
    email: null,
    address: null,
    isActive: true,
    createdAt: "2026-02-15T07:00:00.000Z",
    updatedAt: "2026-02-15T07:00:00.000Z",
  },
  {
    supplierCode: "SUP-003",
    name: "UD Karya Utama",
    phone: "0812-9999-8888",
    email: "karyautama@email.com",
    address: "Jl. Sudirman No. 45, Bandung",
    isActive: false,
    createdAt: "2026-03-20T07:00:00.000Z",
    updatedAt: "2026-03-20T07:00:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Notification state
// ---------------------------------------------------------------------------

interface NotificationState {
  type: "success" | "error";
  message: string;
}

// ---------------------------------------------------------------------------
// Pemasok Page Client
// ---------------------------------------------------------------------------

export function PemasokPageClient() {
  const [suppliers, setSuppliers] = React.useState<Supplier[]>(SAMPLE_SUPPLIERS);
  const [isLoading] = React.useState(false);
  const [error] = React.useState<string | null>(null);

  // Edit dialog state
  const [supplierToEdit, setSupplierToEdit] = React.useState<Supplier | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  // Delete dialog state
  const [supplierToDelete, setSupplierToDelete] =
    React.useState<Supplier | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  // Notification state
  const [notification, setNotification] =
    React.useState<NotificationState | null>(null);

  // Auto-dismiss notification after 5 seconds
  React.useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification]);

  function handleSupplierAdded(supplier: Supplier) {
    setSuppliers((prev) =>
      [...prev, supplier].sort((a, b) => a.name.localeCompare(b.name))
    );
    setNotification({
      type: "success",
      message: `Supplier "${supplier.name}" (${supplier.supplierCode}) berhasil ditambahkan.`,
    });
  }

  function handleRequestEdit(supplier: Supplier) {
    setSupplierToEdit(supplier);
    setIsEditDialogOpen(true);
  }

  function handleSupplierUpdated(updated: Supplier) {
    setSuppliers((prev) =>
      prev
        .map((s) => (s.supplierCode === updated.supplierCode ? updated : s))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
    setNotification({
      type: "success",
      message: `Supplier "${updated.name}" (${updated.supplierCode}) berhasil diperbarui.`,
    });
  }

  function handleRequestDelete(supplier: Supplier) {
    setSupplierToDelete(supplier);
    setIsDeleteDialogOpen(true);
  }

  function handleDeleteConfirm(deleted: Supplier) {
    setSuppliers((prev) =>
      prev.filter((s) => s.supplierCode !== deleted.supplierCode)
    );
    setNotification({
      type: "success",
      message: `Supplier "${deleted.name}" (${deleted.supplierCode}) berhasil dihapus.`,
    });
  }

  function handleRetry() {
    // No-op for local data; wire to API fetch later
  }

  const existingCodes = suppliers.map((s) => s.supplierCode);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Master Supplier
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola informasi dan data supplier.
          </p>
        </div>
        <div className="mt-3 sm:mt-0 shrink-0">
          <SupplierAddDialog
            existingCodes={existingCodes}
            onSupplierAdded={handleSupplierAdded}
          />
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
      <SupplierTable
        suppliers={suppliers}
        isLoading={isLoading}
        error={error}
        onRetry={handleRetry}
        onRequestEdit={handleRequestEdit}
        onRequestDelete={handleRequestDelete}
      />

      {/* Edit dialog */}
      <SupplierEditDialog
        supplier={supplierToEdit}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSupplierUpdated={handleSupplierUpdated}
      />

      {/* Delete confirmation dialog */}
      <SupplierDeleteDialog
        supplier={supplierToDelete}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

