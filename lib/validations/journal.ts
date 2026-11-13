
import { z } from "zod";

const journalLineSchema = z.object({
  accountId: z.string().uuid("ID akun tidak valid"),

  description: z
    .string()
    .trim()
    .max(255, "Keterangan maksimal 255 karakter")
    .optional(),

  debit: z.number().min(0, "Debit tidak boleh negatif").default(0),
  credit: z.number().min(0, "Kredit tidak boleh negatif").default(0),
}).strict().refine(
  (line) => (line.debit > 0 && line.credit === 0) ||
            (line.credit > 0 && line.debit === 0),
  {
    message: "Setiap baris harus memiliki debit atau kredit, bukan keduanya",
  }
);

export const createManualJournalSchema = z.object({
  journalDate: z.iso.date("Tanggal jurnal tidak valid"),

  description: z
    .string()
    .trim()
    .min(1, "Deskripsi jurnal wajib diisi")
    .max(255, "Deskripsi maksimal 255 karakter"),

  lines: z
    .array(journalLineSchema)
    .min(2, "Jurnal minimal memiliki 2 baris")
    .superRefine((lines, ctx) => {
      const totalDebit = lines.reduce(
        (total, line) => total + line.debit,
        0
      );

      const totalCredit = lines.reduce(
        (total, line) => total + line.credit,
        0
      );

      if (Math.round(totalDebit * 100) !== Math.round(totalCredit * 100)) {
        ctx.addIssue({
          code: "custom",
          message: "Total debit dan kredit harus seimbang",
        });
      }
    }),
}).strict();

export type CreateManualJournalInput = z.infer<
  typeof createManualJournalSchema
>;
