
import { z } from "zod";

const dateSchema = z.iso.date({
  error: "Format tanggal harus YYYY-MM-DD",
});

// Maksimal 2 angka desimal dan tidak boleh melebihi Decimal(18,2).
const amountSchema = z
  .number()
  .int("Nominal harus berupa bilangan bulat")
  .nonnegative("Nominal tidak boleh negatif")
  .safe("Nominal terlalu besar");

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
          .positive("Kuantitas harus lebih dari 0")
          .safe("Kuantitas terlalu besar"),

        unitPrice: amountSchema,
      }).strict()
    )
    .min(1, "Minimal harus ada satu produk"),

  initialPayment: amountSchema.default(0),
}).strict();

// CREATE PURCHASE PAYMENT
export const createPurchasePaymentSchema = z.object({
  paymentDate: dateSchema,

  amount: amountSchema
    .positive("Pembayaran harus lebih dari 0"),
}).strict();

// TYPES
export type CreatePurchaseInput = z.infer<
  typeof createPurchaseSchema
>;

export type CreatePurchasePaymentInput = z.infer<
  typeof createPurchasePaymentSchema
>;
