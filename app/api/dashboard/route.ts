import { NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const DASHBOARD_ACCOUNT_CODES = [
  "101",
  "102",
  "103",
  "104",
  "201",
  "401",
] as const;

export async function GET() {
  try {
    const [accounts, recentJournals] = await Promise.all([
      prisma.account.findMany({
        where: {
          code: {
            in: [...DASHBOARD_ACCOUNT_CODES],
          },
        },
        orderBy: {
          code: "asc",
        },
        select: {
          id: true,
          code: true,
          name: true,
          accountType: true,
          normalBalance: true,
        },
      }),
      prisma.journalEntry.findMany({
        orderBy: [{ journalDate: "desc" }, { createdAt: "desc" }],
        take: 5,
        select: {
          id: true,
          journalNumber: true,
          journalDate: true,
          description: true,
          sourceType: true,
          lines: {
            select: {
              debit: true,
              credit: true,
            },
          },
        },
      }),
    ]);

    const accountIds = accounts.map((account) => account.id);
    const accountTotals =
      accountIds.length > 0
        ? await prisma.journalLine.groupBy({
            by: ["accountId"],
            where: {
              accountId: {
                in: accountIds,
              },
            },
            _sum: {
              debit: true,
              credit: true,
            },
          })
        : [];

    const totalsByAccountId = new Map<
      string,
      { debit: Prisma.Decimal; credit: Prisma.Decimal }
    >();

    for (const totals of accountTotals) {
      totalsByAccountId.set(totals.accountId, {
        debit: totals._sum.debit ?? new Prisma.Decimal(0),
        credit: totals._sum.credit ?? new Prisma.Decimal(0),
      });
    }

    const accountBalances = accounts.map((account) => {
      const totals = totalsByAccountId.get(account.id);
      const debit = totals?.debit ?? new Prisma.Decimal(0);
      const credit = totals?.credit ?? new Prisma.Decimal(0);
      const balance =
        account.normalBalance === "DEBIT"
          ? debit.minus(credit)
          : credit.minus(debit);

      return {
        ...account,
        balance: balance.toString(),
      };
    });

    const journalSummaries = recentJournals.map((journal) => {
      const totalDebit = journal.lines.reduce(
        (total, line) => total.plus(line.debit),
        new Prisma.Decimal(0),
      );
      const totalCredit = journal.lines.reduce(
        (total, line) => total.plus(line.credit),
        new Prisma.Decimal(0),
      );

      return {
        id: journal.id,
        journalNumber: journal.journalNumber,
        journalDate: journal.journalDate,
        description: journal.description,
        sourceType: journal.sourceType,
        totalDebit: totalDebit.toString(),
        totalCredit: totalCredit.toString(),
      };
    });

    return NextResponse.json({
      data: {
        accountBalances,
        recentJournals: journalSummaries,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data dashboard" },
      { status: 500 },
    );
  }
}
