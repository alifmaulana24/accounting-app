"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogCloseButton,
  DialogClose,
} from "@/components/ui/dialog";
import { AlertCircle, Building2, Phone, Mail, MapPin, Calendar, Clock } from "lucide-react";
import type { Supplier, GetSupplierResponse } from "@/types/supplier";

interface SupplierDetailDialogProps {
  supplier: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupplierDetailDialog({
  supplier,
  open,
  onOpenChange,
}: SupplierDetailDialogProps) {
  const [data, setData] = React.useState<Supplier | null>(supplier);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open && supplier) {
      setData(supplier);
      setIsLoading(true);
      setError(null);

      fetch(`/api/suppliers/${encodeURIComponent(supplier.supplierCode)}`)
        .then((res) => res.json())
        .then((json: GetSupplierResponse) => {
          if (json.success) {
            setData(json.data);
          } else {
            setError(json.message);
          }
        })
        .catch(() => {
          setError("Gagal memuat detail supplier.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, supplier]);

  if (!supplier) return null;

  function formatDate(isoString?: string) {
    if (!isoString) return "-";
    try {
      return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  }

  const current = data ?? supplier;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-md">
        <DialogCloseButton />
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="size-5 text-muted-foreground" />
            Detail Supplier
          </DialogTitle>
          <DialogDescription>
            Informasi lengkap mengenai data supplier.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col gap-3 py-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <AlertCircle className="size-8 text-destructive" />
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 text-sm">
            {/* Header section: Kode & Status */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Kode Supplier
                </span>
                <span className="font-mono text-base font-semibold text-foreground">
                  {current.supplierCode}
                </span>
              </div>
              <div>
                {current.isActive ? (
                  <Badge
                    variant="default"
                    className="border-0 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                  >
                    Aktif
                  </Badge>
                ) : (
                  <Badge variant="secondary">Nonaktif</Badge>
                )}
              </div>
            </div>

            {/* Nama Supplier */}
            <div>
              <span className="block text-xs font-medium text-muted-foreground">
                Nama Supplier
              </span>
              <span className="text-base font-semibold text-foreground">
                {current.name}
              </span>
            </div>

            {/* Kontak: Telepon & Email */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-2 rounded-lg border border-border p-2.5">
                <Phone className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs text-muted-foreground">Telepon</span>
                  <span className="font-medium text-foreground">
                    {current.phone ?? "-"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-border p-2.5">
                <Mail className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="block text-xs text-muted-foreground">Email</span>
                  <span className="font-medium text-foreground truncate block" title={current.email ?? ""}>
                    {current.email ?? "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Alamat */}
            <div className="flex items-start gap-2 rounded-lg border border-border p-2.5">
              <MapPin className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs text-muted-foreground">Alamat</span>
                <p className="font-medium text-foreground whitespace-pre-wrap">
                  {current.address || "-"}
                </p>
              </div>
            </div>

            {/* Timestamps */}
            <div className="flex flex-col gap-1 border-t border-border pt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                <span>Dibuat: {formatDate(current.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                <span>Terakhir diperbarui: {formatDate(current.updatedAt)}</span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <DialogClose
            render={
              <Button type="button" variant="outline">
                Tutup
              </Button>
            }
          />
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}

