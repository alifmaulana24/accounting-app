import { z } from "zod";

export const createProductSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(1, "SKU wajib diisi.")
    .max(50, "SKU maksimal 50 karakter."),

  name: z
    .string()
    .trim()
    .min(1, "Nama produk wajib diisi.")
    .max(255, "Nama produk maksimal 255 karakter."),

  category: z
    .string()
    .trim()
    .min(1, "Kategori wajib diisi.")
    .max(100, "Kategori maksimal 100 karakter.")
    .transform((value) => value.toUpperCase()),

  brand: z
    .string()
    .trim()
    .max(100, "Brand maksimal 100 karakter.")
    .nullable()
    .optional(),

  unit: z
    .string()
    .trim()
    .min(1, "Satuan wajib diisi.")
    .max(30, "Satuan maksimal 30 karakter.")
    .transform((value) => value.toUpperCase()),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const editProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama produk wajib diisi.")
    .max(255, "Nama produk maksimal 255 karakter."),

  category: z
    .string()
    .trim()
    .min(1, "Kategori wajib diisi.")
    .max(100, "Kategori maksimal 100 karakter.")
    .transform((value) => value.toUpperCase()),

  brand: z.preprocess(
    (value) => {
      if (typeof value === "string" && value.trim() === "") {
        return null;
      }
      return value;
    },
    z
      .string()
      .trim()
      .max(100, "Brand maksimal 100 karakter.")
      .nullable()
      .optional()
  ),

  unit: z
    .string()
    .trim()
    .min(1, "Satuan wajib diisi.")
    .max(30, "Satuan maksimal 30 karakter.")
    .transform((value) => value.toUpperCase()),

  isActive: z.boolean(),
});

export type EditProductInput = z.infer<typeof editProductSchema>;