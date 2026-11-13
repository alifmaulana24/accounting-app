
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { createSalePaymentSchema } from "@/lib/validations/sale";

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

    // 1. Validasi request body
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

    // 2. Proses pembayaran dalam transaksi database
    const result = await prisma.$transaction(async (tx) => {
      // Cari transaksi penjualan
      const sale = await tx.sale.findUnique({
        where: { id },
        include: {
          payments: true,
        },
      });

      if (!sale) {
        throw new Error("SALE_NOT_FOUND");
      }

      // Hitung total pembayaran sebelumnya
      const totalPaid = sale.payments.reduce(
        (total, payment) => total.add(payment.amount),
        new Prisma.Decimal(0)
      );

      // Hitung sisa tagihan
      const outstandingAmount = sale.totalAmount.minus(totalPaid);

      // Pastikan pembayaran tidak melebihi sisa tagihan
      const paymentAmount = new Prisma.Decimal(data.amount);

      if (paymentAmount.greaterThan(outstandingAmount)) {
        throw new Error("PAYMENT_EXCEEDS_OUTSTANDING");
      }

      // Simpan pembayaran
      const payment = await tx.salePayment.create({
        data: {
          saleId: id,
          paymentDate: new Date(
            `${data.paymentDate}T00:00:00.000Z`
          ),
          amount: paymentAmount,
        },
      });

      // Hitung total pembayaran setelah pembayaran baru
      const newTotalPaid = totalPaid.add(paymentAmount);
      const newOutstandingAmount =
        sale.totalAmount.minus(newTotalPaid);

      let paymentStatus: string;

      if (newOutstandingAmount.isZero()) {
        paymentStatus = "Lunas";
      } else if (newTotalPaid.isZero()) {
        paymentStatus = "Belum Dibayar";
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

    // 3. Response berhasil
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
    }

    return NextResponse.json(
      { message: "Gagal menambahkan pembayaran penjualan" },
      { status: 500 }
    );
  }
}
