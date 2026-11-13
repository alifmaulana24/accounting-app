
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: {
            productName: "asc",
          },
        },
        payments: {
          orderBy: [
            { paymentDate: "asc" },
            { createdAt: "asc" },
          ],
        },
      },
    });

    if (!sale) {
      return NextResponse.json(
        { message: "Transaksi penjualan tidak ditemukan" },
        { status: 404 }
      );
    }

    const totalPaid = sale.payments.reduce(
      (total, payment) => total.add(payment.amount),
      new Prisma.Decimal(0)
    );

    const outstandingAmount = sale.totalAmount.minus(totalPaid);

    let paymentStatus: string;

    if (totalPaid.isZero()) {
      paymentStatus = "Belum Dibayar";
    } else if (outstandingAmount.isZero()) {
      paymentStatus = "Lunas";
    } else {
      paymentStatus = "Sebagian";
    }

    return NextResponse.json({
      data: {
        id: sale.id,
        saleNumber: sale.saleNumber,
        saleDate: sale.saleDate,
        customerCode: sale.customerCode,
        customerName: sale.customerName,
        items: sale.items,
        totalAmount: sale.totalAmount,
        payments: sale.payments,
        totalPaid,
        outstandingAmount,
        paymentStatus,
        createdAt: sale.createdAt,
        updatedAt: sale.updatedAt,
      },
    });
  } catch (error) {
    console.error("GET /api/sales/[id] error:", error);

    return NextResponse.json(
      {
        message: "Gagal mengambil detail transaksi penjualan",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const result = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id },
        include: {
          payments: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!sale) {
        throw new Error("SALE_NOT_FOUND");
      }

      if (sale.payments.length > 0) {
        throw new Error("SALE_HAS_PAYMENTS");
      }

      await tx.sale.delete({
        where: { id },
      });

      return sale.saleNumber;
    });

    return NextResponse.json({
      message: "Transaksi penjualan berhasil dihapus",
      data: {
        saleNumber: result,
      },
    });
  } catch (error) {
    console.error("DELETE /api/sales/[id] error:", error);

    if (error instanceof Error) {
      if (error.message === "SALE_NOT_FOUND") {
        return NextResponse.json(
          { message: "Transaksi penjualan tidak ditemukan" },
          { status: 404 }
        );
      }

      if (error.message === "SALE_HAS_PAYMENTS") {
        return NextResponse.json(
          {
            message:
              "Transaksi tidak dapat dihapus karena sudah memiliki riwayat pembayaran",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { message: "Gagal menghapus transaksi penjualan" },
      { status: 500 }
    );
  }
}
