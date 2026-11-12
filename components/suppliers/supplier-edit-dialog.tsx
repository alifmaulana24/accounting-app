"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Loader2 } from "lucide-react";
import { editSupplierSchema } from "@/lib/validations/supplier";
import type {
  Supplier,
  EditSupplierFormData,
  EditSupplierFieldErrors,
} from "@/types/supplier";

// ---------------------------------------------------------------------------
// Field component helpers
// ---------------------------------------------------------------------------

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string[];
  required?: boolean;
  children: React.ReactNode;
}

function FormField({
  label,
  htmlFor,
  error,
  required,
  children,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {error && error.length > 0 && (
        <p className="text-xs text-destructive">{error[0]}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Supplier Edit Dialog
// ---------------------------------------------------------------------------

interface SupplierEditDialogProps {
  supplier: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSupplierUpdated: (updated: Supplier) => void;
}

export function SupplierEditDialog({
  supplier,
  open,
  onOpenChange,
  onSupplierUpdated,
}: SupplierEditDialogProps) {
  const [isPending, setIsPending] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<EditSupplierFieldErrors>(
    {}
  );
  const [formData, setFormData] = React.useState<EditSupplierFormData>({
    name: "",
    phone: "",
    email: "",
    address: "",
    isActive: true,
  });

  // Sync form data when supplier changes
  React.useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        phone: supplier.phone ?? "",
        email: supplier.email ?? "",
        address: supplier.address ?? "",
        isActive: supplier.isActive,
      });
      setFieldErrors({});
    }
  }, [supplier]);

  if (!supplier) return null;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof EditSupplierFormData]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supplier) return;
    setFieldErrors({});

    const result = editSupplierSchema.safeParse({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      isActive: formData.isActive,
    });

    if (!result.success) {
      const errors: EditSupplierFieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof EditSupplierFormData;
        if (!errors[field]) errors[field] = [];
        errors[field]!.push(issue.message);
      }
      setFieldErrors(errors);
      return;
    }

    setIsPending(true);
    // Simulate async (replace with API call later)
    await new Promise((resolve) => setTimeout(resolve, 400));

    const updated: Supplier = {
      supplierCode: supplier.supplierCode,
      createdAt: supplier.createdAt,
      name: formData.name.trim(),
      phone: formData.phone.trim() || null,
      email: formData.email.trim() || null,
      address: formData.address.trim() || null,
      isActive: formData.isActive,
      updatedAt: new Date().toISOString(),
    };

    setIsPending(false);
    onSupplierUpdated(updated);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup>
        <DialogCloseButton />
        <DialogHeader className="mb-4">
          <DialogTitle>Edit Supplier</DialogTitle>
          <DialogDescription>
            Ubah informasi supplier. Kode supplier tidak dapat diubah.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Kode Supplier — readonly */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="edit-supplierCode"
              className="text-sm font-medium text-foreground"
            >
              Kode Supplier
            </label>
            <Input
              id="edit-supplierCode"
              value={supplier.supplierCode}
              readOnly
              disabled
              className="font-mono text-sm text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Kode supplier tidak dapat diubah.
            </p>
          </div>

          <FormField
            label="Nama Supplier"
            htmlFor="edit-name"
            required
            error={fieldErrors.name}
          >
            <Input
              id="edit-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nama supplier"
              maxLength={255}
              disabled={isPending}
              aria-invalid={!!fieldErrors.name}
            />
          </FormField>

          <FormField
            label="Nomor Telepon"
            htmlFor="edit-phone"
            error={fieldErrors.phone}
          >
            <Input
              id="edit-phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Nomor telepon (opsional)"
              maxLength={30}
              disabled={isPending}
              aria-invalid={!!fieldErrors.phone}
            />
          </FormField>

          <FormField
            label="Email"
            htmlFor="edit-email"
            error={fieldErrors.email}
          >
            <Input
              id="edit-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email (opsional)"
              maxLength={255}
              disabled={isPending}
              aria-invalid={!!fieldErrors.email}
            />
          </FormField>

          <FormField
            label="Alamat"
            htmlFor="edit-address"
            error={fieldErrors.address}
          >
            <textarea
              id="edit-address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Alamat supplier (opsional)"
              rows={3}
              disabled={isPending}
              aria-invalid={!!fieldErrors.address}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </FormField>

          {/* Status toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">Status</p>
              <p className="text-xs text-muted-foreground">
                {formData.isActive ? "Supplier aktif" : "Supplier nonaktif"}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={formData.isActive}
              onClick={() =>
                setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
              }
              disabled={isPending}
              className={[
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                formData.isActive ? "bg-primary" : "bg-input",
              ].join(" ")}
            >
              <span
                className={[
                  "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200",
                  formData.isActive ? "translate-x-4" : "translate-x-0",
                ].join(" ")}
              />
            </button>
          </div>

          <DialogFooter className="mt-2">
            <DialogClose
              render={
                <Button type="button" variant="outline" disabled={isPending}>
                  Batal
                </Button>
              }
            />
            <Button type="submit" disabled={isPending} className="gap-1.5">
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}
