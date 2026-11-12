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
import type {
  Customer,
  CreateCustomerFormData,
  CustomerFieldErrors,
  CreateCustomerResponse,
} from "@/types/customer";

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
// Customer Add Form
// ---------------------------------------------------------------------------

interface CustomerAddFormProps {
  onSuccess: (customer: Customer) => void;
  onClose: () => void;
}

function CustomerAddForm({ onSuccess, onClose }: CustomerAddFormProps) {
  const [isPending, setIsPending] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<CustomerFieldErrors>({});
  const [serverError, setServerError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState<CreateCustomerFormData>({
    customerCode: "",
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
    if (fieldErrors[name as keyof CreateCustomerFormData]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (serverError) setServerError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setFieldErrors({});
    setServerError(null);

    try {
      const payload = {
        customerCode: formData.customerCode.trim(),
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        address: formData.address.trim() || null,
      };

      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json: CreateCustomerResponse = await res.json();

      if (json.success) {
        setFormData({
          customerCode: "",
          name: "",
          phone: "",
          email: "",
          address: "",
        });
        onSuccess(json.data);
        onClose();
        return;
      }

      if (res.status === 400 && json.errors) {
        setFieldErrors(json.errors);
      } else {
        setServerError(json.message);
      }
    } catch {
      setServerError("Terjadi kesalahan koneksi. Silakan coba lagi.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField
        label="Kode Customer"
        htmlFor="customerCode"
        required
        error={fieldErrors.customerCode}
      >
        <Input
          id="customerCode"
          name="customerCode"
          value={formData.customerCode}
          onChange={handleChange}
          placeholder="Contoh: CUST-001"
          maxLength={50}
          disabled={isPending}
          aria-invalid={!!fieldErrors.customerCode}
          autoComplete="off"
        />
      </FormField>

      <FormField
        label="Nama Customer"
        htmlFor="name"
        required
        error={fieldErrors.name}
      >
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Contoh: Toko Berkah Abadi"
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
          placeholder="Contoh: 0812-3456-7890 (opsional)"
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
          placeholder="Contoh: customer@example.com (opsional)"
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
          placeholder="Alamat pelanggan (opsional)"
          rows={3}
          disabled={isPending}
          aria-invalid={!!fieldErrors.address}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
      </FormField>

      {serverError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}

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
// Customer Add Dialog
// ---------------------------------------------------------------------------

interface CustomerAddDialogProps {
  onCustomerAdded: (customer: Customer) => void;
}

export function CustomerAddDialog({
  onCustomerAdded,
}: CustomerAddDialogProps) {
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
            Tambah Customer
          </Button>
        }
      />
      <DialogPopup>
        <DialogCloseButton />
        <DialogHeader className="mb-4">
          <DialogTitle>Tambah Customer</DialogTitle>
          <DialogDescription>
            Isi informasi pelanggan baru. Status pelanggan otomatis aktif setelah
            disimpan.
          </DialogDescription>
        </DialogHeader>
        <CustomerAddForm
          onSuccess={onCustomerAdded}
          onClose={handleClose}
        />
      </DialogPopup>
    </Dialog>
  );
}

