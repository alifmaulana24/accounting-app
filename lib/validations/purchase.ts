
import { z } from "zod";

const dateSchema = z.iso.date({
  error: "Format tanggal harus YYYY-MM-DD",
});

// CREATE PURCHASE
export const createPurchaseSchema = z.object({
  purchaseDate: dateSchema,

  supplierCode: z
    .string()
    .min(1, "Supplier wajib dipilih"),

  items: z
    .array(
      z.object({
        productSku: z.string().min(1, "Produk wajib dipilih"),

        quantity: z
          .number()
          .int("Kuantitas harus berupa bilangan bulat")
          .positive("Kuantitas harus lebih dari 0"),

        unitPrice: z
          .number()
          .nonnegative("Harga beli tidak boleh negatif"),
      })
    )
    .min(1, "Minimal harus ada satu produk"),

  initialPayment: z
    .number()
    .nonnegative("Pembayaran awal tidak boleh negatif")
    .default(0),
}).strict();


// UPDATE PURCHASE
export const updatePurchaseSchema = z.object({
  purchaseDate: dateSchema,

  supplierCode: z
    .string()
    .min(1, "Supplier wajib dipilih"),

  items: z
    .array(
      z.object({
        productSku: z.string().min(1, "Produk wajib dipilih"),

        quantity: z
          .number()
          .int("Kuantitas harus berupa bilangan bulat")
          .positive("Kuantitas harus lebih dari 0"),

        unitPrice: z
          .number()
          .nonnegative("Harga beli tidak boleh negatif"),
      })
    )
    .min(1, "Minimal harus ada satu produk"),
}).strict();


// CREATE PURCHASE PAYMENT
export const createPurchasePaymentSchema = z.object({
  paymentDate: dateSchema,

  amount: z
    .number()
    .positive("Pembayaran harus lebih dari 0"),
}).strict();


// TYPES
export type CreatePurchaseInput = z.infer<
  typeof createPurchaseSchema
>;

export type UpdatePurchaseInput = z.infer<
  typeof updatePurchaseSchema
>;

export type CreatePurchasePaymentInput = z.infer<
  typeof createPurchasePaymentSchema
>;
