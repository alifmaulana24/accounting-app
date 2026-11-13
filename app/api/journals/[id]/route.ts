
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const journal = await prisma.journalEntry.findUnique({
      where: { id },
      include: {
        lines: {
          orderBy: {
            lineNumber: "asc",
          },
          include: {
            account: {
              select: {
                id: true,
                code: true,
                name: true,
                accountType: true,
                normalBalance: true,
              },
            },
          },
        },
      },
    });

    if (!journal) {
      return NextResponse.json(
        { message: "Jurnal tidak ditemukan" },
        { status: 404 }
      );
    }

    const totalDebit = journal.lines.reduce(
      (total, line) => total.plus(line.debit),
      new Prisma.Decimal(0)
    );

    const totalCredit = journal.lines.reduce(
      (total, line) => total.plus(line.credit),
      new Prisma.Decimal(0)
    );

    return NextResponse.json({
      data: {
        ...journal,
        totalDebit: totalDebit.toString(),
        totalCredit: totalCredit.toString(),
      },
    });
  } catch (error) {
    console.error("GET /api/journals/[id] error:", error);

    return NextResponse.json(
      { message: "Gagal mengambil detail jurnal" },
      { status: 500 }
    );
  }
}
