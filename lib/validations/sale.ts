import { z } from "zod";

const dateSchema = z.iso.date({
  error: "Format tanggal harus YYYY-MM-DD",
});

const amountSchema = z
  .number()
  .int("Nominal harus berupa bilangan bulat")
  .nonnegative("Nominal tidak boleh negatif")
  .safe("Nominal terlalu besar");

export const createSaleSchema = z
  .object({
    saleDate: dateSchema,

    customerCode: z
      .string()
      .trim()
      .min(1, "Customer harus dipilih"),

    items: z
      .array(
        z.object({
          productSku: z
            .string()
            .trim()
            .min(1, "Produk harus dipilih"),

          quantity: z
            .number()
            .int("Kuantitas harus berupa bilangan bulat")
            .positive("Kuantitas harus lebih dari 0")
            .safe("Kuantitas terlalu besar"),

          unitPrice: amountSchema,
        })
      )
      .min(1, "Minimal harus ada 1 produk"),

    initialPayment: amountSchema.default(0),
  })
  .strict();

export const createSalePaymentSchema = z
  .object({
    paymentDate: dateSchema,

    amount: amountSchema.positive(
      "Pembayaran harus lebih dari 0"
    ),
  })
  .strict();

export type CreateSaleInput = z.infer<
  typeof createSaleSchema
>;

export type CreateSalePaymentInput = z.infer<
  typeof createSalePaymentSchema
>;
