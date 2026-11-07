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
  CreateProductFormData,
  CreateProductResponse,
  ProductFieldErrors,
  Product,
} from "@/types/product";

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

function FormField({ label, htmlFor, error, required, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-foreground"
      >
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
// Product Form
// ---------------------------------------------------------------------------

interface ProductFormProps {
  onSuccess: (product: Product) => void;
  onClose: () => void;
}

function ProductForm({ onSuccess, onClose }: ProductFormProps) {
  const [isPending, setIsPending] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<ProductFieldErrors>({});
  const [serverError, setServerError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState<CreateProductFormData>({
    sku: "",
    name: "",
    category: "",
    brand: "",
    unit: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Hapus error field saat diubah
    if (fieldErrors[name as keyof CreateProductFormData]) {
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
        sku: formData.sku.trim(),
        name: formData.name.trim(),
        category: formData.category.trim(),
        brand: formData.brand.trim() || undefined,
        unit: formData.unit.trim(),
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json: CreateProductResponse = await res.json();

      if (json.success) {
        // Panggil onSuccess dengan data produk yang baru dibuat
        const newProduct: Product = {
          sku: json.data.sku,
          name: formData.name.trim(),
          category: formData.category.trim().toUpperCase(),
          brand: formData.brand.trim() || null,
          unit: formData.unit.trim().toUpperCase(),
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        onSuccess(newProduct);
        onClose();
        return;
      }

      // Error handling
      if (res.status === 400 && json.errors) {
        setFieldErrors(json.errors);
      } else {
        setServerError(json.message);
      }
    } catch {
      setServerError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField label="SKU" htmlFor="sku" required error={fieldErrors.sku}>
        <Input
          id="sku"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          placeholder="Contoh: PRD-001"
          maxLength={50}
          disabled={isPending}
          aria-invalid={!!fieldErrors.sku}
          autoComplete="off"
        />
      </FormField>

      <FormField label="Nama Produk" htmlFor="name" required error={fieldErrors.name}>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Contoh: Cat Food Adult Chicken"
          maxLength={255}
          disabled={isPending}
          aria-invalid={!!fieldErrors.name}
        />
      </FormField>

      <FormField label="Kategori" htmlFor="category" required error={fieldErrors.category}>
        <Input
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="Contoh: Makanan Kucing"
          maxLength={100}
          disabled={isPending}
          aria-invalid={!!fieldErrors.category}
        />
      </FormField>

      <FormField label="Brand" htmlFor="brand" error={fieldErrors.brand}>
        <Input
          id="brand"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          placeholder="Contoh: Whiskas (opsional)"
          maxLength={100}
          disabled={isPending}
          aria-invalid={!!fieldErrors.brand}
        />
      </FormField>

      <FormField label="Satuan" htmlFor="unit" required error={fieldErrors.unit}>
        <Input
          id="unit"
          name="unit"
          value={formData.unit}
          onChange={handleChange}
          placeholder="Contoh: PCS"
          maxLength={30}
          disabled={isPending}
          aria-invalid={!!fieldErrors.unit}
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
// Product Dialog
// ---------------------------------------------------------------------------

interface ProductDialogProps {
  onProductAdded: (product: Product) => void;
}

export function ProductDialog({ onProductAdded }: ProductDialogProps) {
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
            Tambah Produk
          </Button>
        }
      />
      <DialogPopup>
        <DialogCloseButton />
        <DialogHeader className="mb-4">
          <DialogTitle>Tambah Produk</DialogTitle>
          <DialogDescription>
            Isi informasi produk baru. Status produk otomatis aktif setelah disimpan.
          </DialogDescription>
        </DialogHeader>
        <ProductForm onSuccess={onProductAdded} onClose={handleClose} />
      </DialogPopup>
    </Dialog>
  );
}

