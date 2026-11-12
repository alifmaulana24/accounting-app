"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogPopup,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogCloseButton,
  DialogClose,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { createSupplierSchema } from "@/lib/validations/supplier";
import type {
  Supplier,
  CreateSupplierFormData,
  SupplierFieldErrors,
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
// Supplier Add Form
// ---------------------------------------------------------------------------

interface SupplierAddFormProps {
  existingCodes: string[];
  onSuccess: (supplier: Supplier) => void;
  onClose: () => void;
}

function SupplierAddForm({
  existingCodes,
  onSuccess,
  onClose,
}: SupplierAddFormProps) {
  const [isPending, setIsPending] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<SupplierFieldErrors>({});

  const [formData, setFormData] = React.useState<CreateSupplierFormData>({
    supplierCode: "",
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof CreateSupplierFormData]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});

    // Validate with Zod
    const result = createSupplierSchema.safeParse({
      supplierCode: formData.supplierCode,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
    });

    if (!result.success) {
      const errors: SupplierFieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof CreateSupplierFormData;
        if (!errors[field]) errors[field] = [];
        errors[field]!.push(issue.message);
      }
      setFieldErrors(errors);
      return;
    }

    // Check uniqueness
    const trimmedCode = formData.supplierCode.trim().toUpperCase();
    if (
      existingCodes.some((c) => c.toUpperCase() === trimmedCode)
    ) {
      setFieldErrors({
        supplierCode: ["Kode supplier sudah digunakan. Gunakan kode yang berbeda."],
      });
      return;
    }

    setIsPending(true);
    // Simulate async (replace with API call later)
    await new Promise((resolve) => setTimeout(resolve, 400));

    const now = new Date().toISOString();
    const newSupplier: Supplier = {
      supplierCode: trimmedCode,
      name: formData.name.trim(),
      phone: formData.phone.trim() || null,
      email: formData.email.trim() || null,
      address: formData.address.trim() || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    setIsPending(false);
    onSuccess(newSupplier);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField
        label="Kode Supplier"
        htmlFor="supplierCode"
        required
        error={fieldErrors.supplierCode}
      >
        <Input
          id="supplierCode"
          name="supplierCode"
          value={formData.supplierCode}
          onChange={handleChange}
          placeholder="Contoh: SUP-001"
          maxLength={50}
          disabled={isPending}
          aria-invalid={!!fieldErrors.supplierCode}
          autoComplete="off"
        />
      </FormField>

      <FormField
        label="Nama Supplier"
        htmlFor="name"
        required
        error={fieldErrors.name}
      >
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Contoh: PT Maju Bersama"
          maxLength={255}
          disabled={isPending}
          aria-invalid={!!fieldErrors.name}
        />
      </FormField>

      <FormField
        label="Nomor Telepon"
        htmlFor="phone"
        error={fieldErrors.phone}
      >
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Contoh: 021-55512345 (opsional)"
          maxLength={30}
          disabled={isPending}
          aria-invalid={!!fieldErrors.phone}
        />
      </FormField>

      <FormField label="Email" htmlFor="email" error={fieldErrors.email}>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Contoh: info@supplier.com (opsional)"
          maxLength={255}
          disabled={isPending}
          aria-invalid={!!fieldErrors.email}
        />
      </FormField>

      <FormField label="Alamat" htmlFor="address" error={fieldErrors.address}>
        <textarea
          id="address"
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
          {isPending ? "Menyimpan..." : "Simpan"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Supplier Add Dialog
// ---------------------------------------------------------------------------

interface SupplierAddDialogProps {
  existingCodes: string[];
  onSupplierAdded: (supplier: Supplier) => void;
}

export function SupplierAddDialog({
  existingCodes,
  onSupplierAdded,
}: SupplierAddDialogProps) {
  const [open, setOpen] = React.useState(false);

  function handleClose() {
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-1.5">
            <Plus className="size-4" />
            Tambah Supplier
          </Button>
        }
      />
      <DialogPopup>
        <DialogCloseButton />
        <DialogHeader className="mb-4">
          <DialogTitle>Tambah Supplier</DialogTitle>
          <DialogDescription>
            Isi informasi supplier baru. Status supplier otomatis aktif setelah
            disimpan.
          </DialogDescription>
        </DialogHeader>
        <SupplierAddForm
          existingCodes={existingCodes}
          onSuccess={onSupplierAdded}
          onClose={handleClose}
        />
      </DialogPopup>
    </Dialog>
  );
}

