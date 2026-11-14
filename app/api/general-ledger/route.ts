
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

function parseDate(value: string | null): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    return null;
  }

  return date;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const accountId = searchParams.get("accountId");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // Validasi parameter
    if (!accountId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(accountId)) {
      return NextResponse.json(
        { message: "ID akun tidak valid" },
        { status: 400 }
      );
    }

    const startDate = parseDate(startDateParam);
    const endDate = parseDate(endDateParam);

    if (!startDate || !endDate) {
      return NextResponse.json(
        { message: "Tanggal awal atau akhir tidak valid" },
        { status: 400 }
      );
    }

    if (startDate > endDate) {
      return NextResponse.json(
        { message: "Tanggal awal tidak boleh melebihi tanggal akhir" },
        { status: 400 }
      );
    }

    // Mengambil informasi akun
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        code: true,
        name: true,
        accountType: true,
        normalBalance: true,
        isActive: true,
      },
    });

    if (!account) {
      return NextResponse.json(
        { message: "Akun tidak ditemukan" },
        { status: 404 }
      );
    }

    // Tanggal akhir dibuat eksklusif agar seluruh transaksi
    // pada tanggal akhir tetap ikut dihitung.
    const endDateExclusive = new Date(endDate);
    endDateExclusive.setUTCDate(endDateExclusive.getUTCDate() + 1);

    // 1. Menghitung saldo awal sebelum periode laporan
    const openingAggregate = await prisma.journalLine.aggregate({
      where: {
        accountId,
        journalEntry: {
          journalDate: {
            lt: startDate,
          },
        },
      },
      _sum: {
        debit: true,
        credit: true,
      },
    });

    const openingDebit =
      openingAggregate._sum.debit ?? new Prisma.Decimal(0);

    const openingCredit =
      openingAggregate._sum.credit ?? new Prisma.Decimal(0);

    let runningBalance =
      account.normalBalance === "DEBIT"
        ? openingDebit.minus(openingCredit)
        : openingCredit.minus(openingDebit);

    const openingBalance = runningBalance;

    // 2. Mengambil seluruh mutasi akun selama periode
    const journalLines = await prisma.journalLine.findMany({
      where: {
        accountId,
        journalEntry: {
          journalDate: {
            gte: startDate,
            lt: endDateExclusive,
          },
        },
      },
      include: {
        journalEntry: {
          select: {
            id: true,
            journalNumber: true,
            journalDate: true,
            description: true,
            sourceType: true,
          },
        },
      },
      orderBy: [
        { journalEntry: { journalDate: "asc" } },
        { journalEntry: { journalNumber: "asc" } },
        { lineNumber: "asc" },
      ],
    });

    // 3. Menghitung total mutasi dan saldo berjalan
    let totalDebit = new Prisma.Decimal(0);
    let totalCredit = new Prisma.Decimal(0);

    const transactions = journalLines.map((line) => {
      totalDebit = totalDebit.plus(line.debit);
      totalCredit = totalCredit.plus(line.credit);

      const movement =
        account.normalBalance === "DEBIT"
          ? line.debit.minus(line.credit)
          : line.credit.minus(line.debit);

      runningBalance = runningBalance.plus(movement);

      return {
        journalEntryId: line.journalEntry.id,
        journalNumber: line.journalEntry.journalNumber,
        journalDate: line.journalEntry.journalDate,
        description: line.description || line.journalEntry.description,
        sourceType: line.journalEntry.sourceType,
        lineNumber: line.lineNumber,
        debit: line.debit.toString(),
        credit: line.credit.toString(),
        runningBalance: runningBalance.toString(),
      };
    });

    // 4. Mengembalikan hasil Buku Besar
    return NextResponse.json({
      data: {
        account,
        period: {
          startDate: startDateParam,
          endDate: endDateParam,
        },
        openingBalance: openingBalance.toString(),
        totalDebit: totalDebit.toString(),
        totalCredit: totalCredit.toString(),
        closingBalance: runningBalance.toString(),
        transactions,
      },
    });
  } catch (error) {
    console.error("GET /api/general-ledger error:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data Buku Besar" },
      { status: 500 }
    );
  }
}
