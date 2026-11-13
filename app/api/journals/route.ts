
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { createManualJournalSchema } from "@/lib/validations/journal";

// GET: Mengambil daftar jurnal
export async function GET() {
  try {
    const journals = await prisma.journalEntry.findMany({
      orderBy: [
        { journalDate: "desc" },
        { createdAt: "desc" },
      ],
      take: 100,
      include: {
        lines: {
          select: {
            debit: true,
            credit: true,
          },
        },
      },
    });

    const data = journals.map((journal) => {
      const totalDebit = journal.lines.reduce(
        (total, line) => total.plus(line.debit),
        new Prisma.Decimal(0)
      );

      const totalCredit = journal.lines.reduce(
        (total, line) => total.plus(line.credit),
        new Prisma.Decimal(0)
      );

      return {
        id: journal.id,
        journalNumber: journal.journalNumber,
        journalDate: journal.journalDate,
        description: journal.description,
        sourceType: journal.sourceType,
        sourceId: journal.sourceId,
        createdAt: journal.createdAt,
        totalDebit: totalDebit.toString(),
        totalCredit: totalCredit.toString(),
      };
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/journals error:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data jurnal" },
      { status: 500 }
    );
  }
}

// POST: Membuat jurnal manual
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = createManualJournalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Validasi gagal",
          errors: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    const journalDate = new Date(
      `${data.journalDate}T00:00:00.000Z`
    );

    const yearMonth = data.journalDate.slice(0, 7).replace("-", "");
    const prefix = `JRN-${yearMonth}-`;

    const journal = await prisma.$transaction(async (tx) => {

      // Memeriksa seluruh akun yang digunakan
      const accountIds = [
        ...new Set(data.lines.map((line) => line.accountId)),
      ];

      const accounts = await tx.account.findMany({
        where: {
          id: { in: accountIds },
          isActive: true,
        },
        select: {
          id: true,
        },
      });

      if (accounts.length !== accountIds.length) {
        throw new Error("ACCOUNT_NOT_AVAILABLE");
      }

      // Menghasilkan nomor jurnal berikutnya
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

      const nextNumber = String(lastNumber + 1).padStart(4, "0");
      const journalNumber = `${prefix}${nextNumber}`;

      // Menyimpan header dan detail jurnal sekaligus
      return tx.journalEntry.create({
        data: {
          journalNumber,
          journalDate,
          description: data.description,
          sourceType: "MANUAL",
          sourceId: null,

          lines: {
            create: data.lines.map((line, index) => ({
              accountId: line.accountId,
              lineNumber: index + 1,
              description: line.description || null,
              debit: new Prisma.Decimal(line.debit),
              credit: new Prisma.Decimal(line.credit),
            })),
          },
        },
        include: {
          lines: {
            include: {
              account: {
                select: {
                  code: true,
                  name: true,
                  accountType: true,
                  normalBalance: true,
                },
              },
            },
            orderBy: {
              lineNumber: "asc",
            },
          },
        },
      });
    });

    return NextResponse.json(
      {
        message: "Jurnal berhasil dibuat",
        data: journal,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/journals error:", error);

    if (
      error instanceof Error &&
      error.message === "ACCOUNT_NOT_AVAILABLE"
    ) {
      return NextResponse.json(
        { message: "Akun tidak ditemukan atau sudah tidak aktif" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Gagal membuat jurnal" },
      { status: 500 }
    );
  }
}
