
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { createPurchasePaymentSchema } from "@/lib/validations/purchase";
import { createJournalEntry } from "@/lib/journal";
import { z } from "zod";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const idValidation = z.uuid().safeParse(id);

        if (!idValidation.success) {
            return Response.json(
                {
                    success: false,
                    message: "ID pembelian tidak valid.",
                },
                { status: 400 }
            );
        }

        const body = await request.json();
        const validation = createPurchasePaymentSchema.safeParse(body);

        if (!validation.success) {
            return Response.json(
                {
                    success: false,
                    message: "Validasi data gagal.",
                    errors: validation.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const data = validation.data;

        const paymentDate = new Date(
            `${data.paymentDate}T00:00:00.000Z`
        );

        if (
            Number.isNaN(paymentDate.getTime()) ||
            paymentDate.toISOString().slice(0, 10) !== data.paymentDate
        ) {
            return Response.json(
                {
                    success: false,
                    message: "Tanggal pembayaran tidak valid.",
                },
                { status: 400 }
            );
        }

        const result = await prisma.$transaction(async (tx) => {
            const purchase = await tx.purchase.findUnique({
                where: { id },
                include: {
                    payments: {
                        select: {
                            amount: true,
                        },
                    },
                },
            });

            if (!purchase) {
                throw new Error("PURCHASE_NOT_FOUND");
            }

            const totalPaid = purchase.payments.reduce(
                (sum, payment) => sum.plus(payment.amount),
                new Prisma.Decimal(0)
            );

            const outstandingAmount = purchase.totalAmount.minus(totalPaid);
            const paymentAmount = new Prisma.Decimal(data.amount);

            if (paymentAmount.greaterThan(outstandingAmount)) {
                throw new Error("PAYMENT_EXCEEDS_OUTSTANDING");
            }

            // Simpan pembayaran susulan
            const payment = await tx.purchasePayment.create({
                data: {
                    purchaseId: id,
                    paymentDate,
                    amount: paymentAmount,
                },
            });

            // Buat jurnal pembayaran susulan
            await createJournalEntry(tx, {
                journalDate: paymentDate,
                description: `Pembayaran pembelian ${purchase.purchaseNumber}`,
                sourceType: "PURCHASE_PAYMENT",
                sourceId: payment.id,
                lines: [
                    {
                        accountCode: "201",
                        description: "Pembayaran utang usaha",
                        debit: paymentAmount,
                        credit: new Prisma.Decimal(0),
                    },
                    {
                        accountCode: "101",
                        description: "Pembayaran melalui kas",
                        debit: new Prisma.Decimal(0),
                        credit: paymentAmount,
                    },
                ],
            });

            const newTotalPaid = totalPaid.plus(paymentAmount);
            const newOutstandingAmount = purchase.totalAmount.minus(newTotalPaid);

            const paymentStatus = newTotalPaid.isZero()
                ? "Belum Dibayar"
                : newTotalPaid.greaterThanOrEqualTo(purchase.totalAmount)
                    ? "Lunas"
                    : "Sebagian";

            return {
                payment,
                totalPaid: newTotalPaid,
                outstandingAmount: newOutstandingAmount,
                paymentStatus,
            };
        });

        return Response.json(
            {
                success: true,
                message: "Pembayaran berhasil ditambahkan.",
                data: result,
            },
            { status: 201 }
        );

    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "PURCHASE_NOT_FOUND") {
                return Response.json(
                    {
                        success: false,
                        message: "Data pembelian tidak ditemukan.",
                    },
                    { status: 404 }
                );
            }

            if (error.message === "PAYMENT_EXCEEDS_OUTSTANDING") {
                return Response.json(
                    {
                        success: false,
                        message: "Pembayaran melebihi sisa tagihan.",
                    },
                    { status: 400 }
                );
            }

            if (error.message === "JOURNAL_ACCOUNT_NOT_FOUND_OR_INACTIVE") {
                console.error("Purchase payment journal account error:", error);

                return Response.json(
                    {
                        success: false,
                        message: "Akun COA untuk jurnal pembayaran tidak ditemukan atau tidak aktif.",
                    },
                    { status: 500 }
                );
            }

            if (error.message === "INVALID_JOURNAL_BALANCE") {
                console.error("Purchase payment journal balance error:", error);

                return Response.json(
                    {
                        success: false,
                        message: "Jurnal pembayaran tidak seimbang.",
                    },
                    { status: 500 }
                );
            }
        }

        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002"
        ) {
            return Response.json(
                {
                    success: false,
                    message: "Jurnal pembayaran sudah tercatat.",
                },
                { status: 409 }
            );
        }

        console.error("POST /api/purchases/[id]/payments error:", error);

        return Response.json(
            {
                success: false,
                message: "Gagal menambahkan pembayaran.",
            },
            { status: 500 }
        );
    }
}
