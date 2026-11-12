import { z } from "zod";

export const createCustomerSchema = z.object({
  customerCode: z
    .string()
    .trim()
    .min(1, "Kode pelanggan wajib diisi.")
    .max(50, "Kode pelanggan maksimal 50 karakter."),

  name: z
    .string()
    .trim()
    .min(1, "Nama pelanggan wajib diisi.")
    .max(255, "Nama pelanggan maksimal 255 karakter."),

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

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

export const editCustomerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama pelanggan wajib diisi.")
    .max(255, "Nama pelanggan maksimal 255 karakter."),

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

export type EditCustomerInput = z.infer<typeof editCustomerSchema>;

