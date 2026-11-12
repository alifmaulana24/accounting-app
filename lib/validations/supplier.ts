import { z } from "zod";

export const createSupplierSchema = z.object({
  supplierCode: z
    .string()
    .trim()
    .min(1, "Kode supplier wajib diisi.")
    .max(50, "Kode supplier maksimal 50 karakter."),

  name: z
    .string()
    .trim()
    .min(1, "Nama supplier wajib diisi.")
    .max(255, "Nama supplier maksimal 255 karakter."),

    phone: z.preprocess(
    (value) => {
        if (typeof value === "string" && value.trim() === "") {
        return null;
        }

        return value;
    },
    z
        .string()
        .trim()
        .max(30, "Nomor telepon maksimal 30 karakter.")
        .nullable()
        .optional()
    ),


    email: z.preprocess(
    (value) => {
        if (typeof value === "string" && value.trim() === "") {
        return null;
        }

        return value;
    },
    z
        .email("Format email tidak valid.")
        .max(255, "Email maksimal 255 karakter.")
        .nullable()
        .optional()
    ),


    address: z.preprocess(
    (value) => {
        if (typeof value === "string" && value.trim() === "") {
        return null;
        }

        return value;
    },
    z
        .string()
        .trim()
        .nullable()
        .optional()
    ),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;

export const editSupplierSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama supplier wajib diisi.")
    .max(255, "Nama supplier maksimal 255 karakter."),

  phone: z.preprocess(
    (value) => {
      if (typeof value === "string" && value.trim() === "") {
        return null;
      }
      return value;
    },
    z
      .string()
      .trim()
      .max(30, "Nomor telepon maksimal 30 karakter.")
      .nullable()
      .optional()
  ),

  email: z.preprocess(
    (value) => {
      if (typeof value === "string" && value.trim() === "") {
        return null;
      }
      return value;
    },
    z
      .email("Format email tidak valid.")
      .max(255, "Email maksimal 255 karakter.")
      .nullable()
      .optional()
  ),

  address: z.preprocess(
    (value) => {
      if (typeof value === "string" && value.trim() === "") {
        return null;
      }
      return value;
    },
    z.string().trim().nullable().optional()
  ),

  isActive: z.boolean(),
});

export type EditSupplierInput = z.infer<typeof editSupplierSchema>;
