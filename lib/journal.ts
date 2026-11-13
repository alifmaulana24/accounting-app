
import { Prisma } from "@/lib/generated/prisma/client";

type JournalSourceType =
    | "PURCHASE"
    | "PURCHASE_PAYMENT"
    | "SALE"
    | "SALE_PAYMENT";

type JournalLineInput = {
    accountCode: string;
    description?: string;
    debit: Prisma.Decimal;
    credit: Prisma.Decimal;
};

type CreateJournalInput = {
    journalDate: Date;
    description: string;
    sourceType: JournalSourceType;
    sourceId: string;
    lines: JournalLineInput[];
};

export async function createJournalEntry(
    tx: Prisma.TransactionClient,
    input: CreateJournalInput
) {
    // 1. Pastikan akun yang dibutuhkan tersedia dan aktif
    const accountCodes = [
        ...new Set(input.lines.map((line) => line.accountCode)),
    ];

    const accounts = await tx.account.findMany({
        where: {
            code: { in: accountCodes },
            isActive: true,
        },
        select: {
            id: true,
            code: true,
        },
    });

    const accountMap = new Map(
        accounts.map((account) => [account.code, account.id])
    );

    if (accountMap.size !== accountCodes.length) {
        throw new Error("JOURNAL_ACCOUNT_NOT_FOUND_OR_INACTIVE");
    }

    // 2. Generate nomor jurnal
    const year = input.journalDate.getUTCFullYear();
    const month = String(
        input.journalDate.getUTCMonth() + 1
    ).padStart(2, "0");

    const prefix = `JRN-${year}${month}-`;

    const lastJournal = await tx.journalEntry.findFirst({
        where: {
            journalNumber: {
                startsWith: prefix,
            },
        },
        orderBy: {
            journalNumber: "desc",
        },
        select: {
            journalNumber: true,
        },
    });

    const lastNumber = lastJournal
        ? Number(lastJournal.journalNumber.slice(prefix.length))
        : 0;

    const journalNumber =
        `${prefix}${String(lastNumber + 1).padStart(4, "0")}`;

    // 3. Buat header dan rincian jurnal
    return tx.journalEntry.create({
        data: {
            journalNumber,
            journalDate: input.journalDate,
            description: input.description,
            sourceType: input.sourceType,
            sourceId: input.sourceId,

            lines: {
                create: input.lines.map((line, index) => ({
                    accountId: accountMap.get(line.accountCode)!,
                    lineNumber: index + 1,
                    description: line.description,
                    debit: line.debit,
                    credit: line.credit,
                })),
            },
        },
    });
}
