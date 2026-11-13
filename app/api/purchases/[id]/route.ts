import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { z } from "zod";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const validation = z.uuid().safeParse(id);

        if (!validation.success) {
            return Response.json(
                {
                    success: false,
                    message: "ID pembelian tidak valid.",
                },
                { status: 400 }
            );
        }

        const purchase = await prisma.purchase.findUnique({
            where: { id },
            include: {
                items: true,
                payments: {
                    orderBy: {
                        paymentDate: "desc",
                    },
                },
            },
        });

        if (!purchase) {
            return Response.json(
                {
                    success: false,
                    message: "Data pembelian tidak ditemukan.",
                },
                { status: 404 }
            );
        }

        const totalPaid = purchase.payments.reduce(
            (sum, payment) => sum.plus(payment.amount),
            new Prisma.Decimal(0)
        );

        const outstandingAmount = purchase.totalAmount.minus(totalPaid);

        const paymentStatus = totalPaid.isZero()
            ? "Belum Dibayar"
            : totalPaid.greaterThanOrEqualTo(purchase.totalAmount)
                ? "Lunas"
                : "Sebagian";

        return Response.json({
            success: true,
            data: {
                ...purchase,
                totalPaid,
                outstandingAmount,
                paymentStatus,
            },
        });

    } catch (error) {
        console.error("GET /api/purchases/[id] error:", error);

        return Response.json(
            {
                success: false,
                message: "Gagal mengambil detail pembelian.",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const validation = z.uuid().safeParse(id);

        if (!validation.success) {
            return Response.json(
                {
                    success: false,
                    message: "ID pembelian tidak valid.",
                },
                { status: 400 }
            );
        }

        await prisma.$transaction(async (tx) => {
            const purchase = await tx.purchase.findUnique({
                where: { id },
            });

            if (!purchase) {
                throw new Error("PURCHASE_NOT_FOUND");
            }

            const paymentCount = await tx.purchasePayment.count({
                where: { purchaseId: id },
            });

            if (paymentCount > 0) {
                throw new Error("PURCHASE_HAS_PAYMENTS");
            }

            await tx.purchase.delete({
                where: { id },
            });
        });

        return Response.json({
            success: true,
            message: "Pembelian berhasil dihapus.",
        });

    } catch (error) {
        if (error instanceof Error && error.message === "PURCHASE_NOT_FOUND") {
            return Response.json(
                {
                    success: false,
                    message: "Data pembelian tidak ditemukan.",
                },
                { status: 404 }
            );
        }

        if (error instanceof Error && error.message === "PURCHASE_HAS_PAYMENTS") {
            return Response.json(
                {
                    success: false,
                    message: "Pembelian tidak dapat dihapus karena sudah memiliki riwayat pembayaran.",
                },
                { status: 400 }
            );
        }

        console.error("DELETE /api/purchases/[id] error:", error);

        return Response.json(
            {
                success: false,
                message: "Gagal menghapus pembelian.",
            },
            { status: 500 }
        );
    }
}