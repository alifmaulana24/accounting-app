
import { z } from "zod";

export const accountTypeEnum = z.enum([
  "ASSET",
  "LIABILITY",
  "EQUITY",
  "REVENUE",
  "EXPENSE",
]);

export const normalBalanceEnum = z.enum([
  "DEBIT",
  "CREDIT",
]);

export const createAccountSchema = z.object({
  code: z
    .string()
    .regex(/^\d{3}$/, "Kode akun harus terdiri dari 3 digit"),

  name: z
    .string()
    .trim()
    .min(1, "Nama akun wajib diisi")
    .max(100, "Nama akun maksimal 100 karakter"),

  accountType: accountTypeEnum,

  normalBalance: normalBalanceEnum,
}).strict();

export const updateAccountSchema = createAccountSchema
  .partial()
  .extend({
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "Minimal satu field harus diisi"
  );
