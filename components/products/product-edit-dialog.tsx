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
import type {
  Product,
  EditProductFormData,
  EditProductFieldErrors,
  UpdateProductResponse,
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
// Product Edit Dialog
// ---------------------------------------------------------------------------

interface ProductEditDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductUpdated: (updated: Product) => void;
}

export function ProductEditDialog({
  product,
  open,
  onOpenChange,
  onProductUpdated,
}: ProductEditDialogProps) {
  const [isPending, setIsPending] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<EditProductFieldErrors>(
    {}
  );
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<EditProductFormData>({
    name: "",
    category: "",
    brand: "",
    unit: "",
    isActive: true,
  });

  // Sync form data when product changes
  React.useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        brand: product.brand ?? "",
        unit: product.unit,
        isActive: product.isActive,
      });
      setFieldErrors({});
      setServerError(null);
    }
  }, [product]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof EditProductFormData]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (serverError) setServerError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!product) return;

    setIsPending(true);
    setFieldErrors({});
    setServerError(null);

    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        brand: formData.brand.trim() || null,
        unit: formData.unit.trim(),
        isActive: formData.isActive,
      };

      const res = await fetch(
        `/api/products/${encodeURIComponent(product.sku)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const json: UpdateProductResponse = await res.json();

      if (json.success) {
        onProductUpdated(json.data);
        onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup>
        <DialogCloseButton />
        <DialogHeader className="mb-4">
          <DialogTitle>Edit Produk</DialogTitle>
          <DialogDescription>
            Ubah informasi data produk. SKU bersifat permanen dan tidak dapat
            diubah.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* SKU: Readonly */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              SKU Produk
            </label>
            <Input
              value={product?.sku ?? ""}
              disabled
              readOnly
              className="bg-muted font-mono text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              SKU adalah primary key dan tidak dapat diubah.
            </p>
          </div>

          <FormField
            label="Nama Produk"
            htmlFor="edit-product-name"
            error={fieldErrors.name}
            required
          >
            <Input
              id="edit-product-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nama produk"
              maxLength={255}
              disabled={isPending}
              aria-invalid={!!fieldErrors.name}
            />
          </FormField>

          <FormField
            label="Kategori"
            htmlFor="edit-product-category"
            error={fieldErrors.category}
            required
          >
            <Input
              id="edit-product-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Kategori produk (misal: MAKANAN KUCING)"
              maxLength={100}
              disabled={isPending}
              aria-invalid={!!fieldErrors.category}
            />
          </FormField>

          <FormField
            label="Brand"
            htmlFor="edit-product-brand"
            error={fieldErrors.brand}
          >
            <Input
              id="edit-product-brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="Brand produk (opsional, misal: Choize)"
              maxLength={100}
              disabled={isPending}
              aria-invalid={!!fieldErrors.brand}
            />
          </FormField>

          <FormField
            label="Satuan"
            htmlFor="edit-product-unit"
            error={fieldErrors.unit}
            required
          >
            <Input
              id="edit-product-unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              placeholder="Satuan produk (misal: PCS, PACK, KG)"
              maxLength={30}
              disabled={isPending}
              aria-invalid={!!fieldErrors.unit}
            />
          </FormField>

          {/* Status toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">Status</p>
              <p className="text-xs text-muted-foreground">
                {formData.isActive ? "Produk aktif" : "Produk nonaktif"}
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
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}

