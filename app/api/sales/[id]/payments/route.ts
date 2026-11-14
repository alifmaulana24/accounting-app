
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { createSalePaymentSchema } from "@/lib/validations/sale";
import { createJournalEntry } from "@/lib/journal";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    // 1. Validate request body
    const body = await request.json();
    const validation = createSalePaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Validasi pembayaran gagal",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 2. Process payment in database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Find sale transaction
      const sale = await tx.sale.findUnique({
        where: { id },
        include: {
          payments: true,
        },
      });

      if (!sale) {
        throw new Error("SALE_NOT_FOUND");
      }

      // Calculate previous payments
      const totalPaid = sale.payments.reduce(
        (total, payment) => total.add(payment.amount),
        new Prisma.Decimal(0)
      );

      // Calculate outstanding amount
      const outstandingAmount = sale.totalAmount.minus(totalPaid);

      // Validate payment amount
      const paymentAmount = new Prisma.Decimal(data.amount);

      if (!paymentAmount.greaterThan(0)) {
        throw new Error("INVALID_PAYMENT_AMOUNT");
      }

      if (paymentAmount.greaterThan(outstandingAmount)) {
        throw new Error("PAYMENT_EXCEEDS_OUTSTANDING");
      }

      const paymentDate = new Date(
        `${data.paymentDate}T00:00:00.000Z`
      );

      // Save payment
      const payment = await tx.salePayment.create({
        data: {
          saleId: id,
          paymentDate,
          amount: paymentAmount,
        },
      });

      // Create separate journal for subsequent payment
      await createJournalEntry(tx, {
        journalDate: paymentDate,
        description: `Pembayaran penjualan ${sale.saleNumber}`,
        sourceType: "SALE_PAYMENT",
        sourceId: payment.id,
        lines: [
          {
            accountCode: "101",
            description: "Penerimaan pembayaran penjualan",
            debit: paymentAmount,
            credit: new Prisma.Decimal(0),
          },
          {
            accountCode: "103",
            description: "Pengurangan piutang usaha",
            debit: new Prisma.Decimal(0),
            credit: paymentAmount,
          },
        ],
      });

      // Calculate payment status after new payment
      const newTotalPaid = totalPaid.add(paymentAmount);
      const newOutstandingAmount =
        sale.totalAmount.minus(newTotalPaid);

      let paymentStatus: string;

      if (newOutstandingAmount.isZero()) {
        paymentStatus = "Lunas";
      } else {
        paymentStatus = "Sebagian";
      }

      return {
        payment,
        totalPaid: newTotalPaid,
        outstandingAmount: newOutstandingAmount,
        paymentStatus,
      };
    });

    // 3. Success response
    return NextResponse.json(
      {
        message: "Pembayaran penjualan berhasil ditambahkan",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/sales/[id]/payments error:", error);

    if (error instanceof Error) {
      if (error.message === "SALE_NOT_FOUND") {
        return NextResponse.json(
          { message: "Transaksi penjualan tidak ditemukan" },
          { status: 404 }
        );
      }

      if (error.message === "PAYMENT_EXCEEDS_OUTSTANDING") {
        return NextResponse.json(
          { message: "Pembayaran melebihi sisa tagihan" },
          { status: 400 }
        );
      }

      if (error.message === "INVALID_PAYMENT_AMOUNT") {
        return NextResponse.json(
          { message: "Jumlah pembayaran harus lebih dari nol" },
          { status: 400 }
        );
      }

      if (
        error.message === "ACCOUNT_NOT_FOUND" ||
        error.message === "ACCOUNT_INACTIVE" ||
        error.message === "INVALID_JOURNAL_BALANCE"
      ) {
        return NextResponse.json(
          { message: "Gagal membuat jurnal pembayaran penjualan." },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { message: "Gagal menambahkan pembayaran penjualan" },
      { status: 500 }
    );
  }
}
