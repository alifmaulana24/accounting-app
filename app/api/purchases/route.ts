
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { createPurchaseSchema } from "@/lib/validations/purchase";
import { createJournalEntry } from "@/lib/journal";

// /api/purchase GET
export async function GET() {
    try {
        const purchases = await prisma.purchase.findMany({
            orderBy: [
                { purchaseDate: "desc" },
                { createdAt: "desc" },
            ],
            include: {
                payments: {
                    select: {
                        amount: true,
                    },
                },
            },
        });

        const data = purchases.map((purchase) => {
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

            return {
                id: purchase.id,
                purchaseNumber: purchase.purchaseNumber,
                purchaseDate: purchase.purchaseDate,
                supplierCode: purchase.supplierCode,
                supplierName: purchase.supplierName,
                totalAmount: purchase.totalAmount,
                totalPaid,
                outstandingAmount,
                paymentStatus,
            };
        });

        return Response.json({
            success: true,
            data,
        });

    } catch (error) {
        console.error("GET /api/purchases error:", error);

        return Response.json(
            {
                success: false,
                message: "Gagal mengambil data pembelian.",
            },
            { status: 500 }
        );
    }
}

// /api/purchase POST
export async function POST(request: Request) {
    try {
        // 1. Ambil dan validasi request body
        const body = await request.json();

        const validation = createPurchaseSchema.safeParse(body);

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

        // 2. Validasi tanggal
        const purchaseDate = new Date(
            `${data.purchaseDate}T00:00:00.000Z`
        );

        if (
            Number.isNaN(purchaseDate.getTime()) ||
            purchaseDate.toISOString().slice(0, 10) !== data.purchaseDate
        ) {
            return Response.json(
                {
                    success: false,
                    message: "Tanggal pembelian tidak valid.",
                },
                { status: 400 }
            );
        }

        // 3. Pastikan tidak ada SKU duplikat
        const productSkus = data.items.map((item) => item.productSku);
        const uniqueSkus = new Set(productSkus);

        if (uniqueSkus.size !== productSkus.length) {
            return Response.json(
                {
                    success: false,
                    message: "Produk yang sama tidak boleh dimasukkan dua kali.",
                },
                { status: 400 }
            );
        }

        // 4. Proses transaksi database
        const purchase = await prisma.$transaction(async (tx) => {

            // Cari supplier
            const supplier = await tx.supplier.findUnique({
                where: {
                    supplierCode: data.supplierCode,
                },
            });

            if (!supplier || !supplier.isActive) {
                throw new Error("SUPPLIER_NOT_FOUND");
            }

            // Cari seluruh produk
            const products = await tx.product.findMany({
                where: {
                    sku: {
                        in: productSkus,
                    },
                },
            });

            // Pastikan semua produk tersedia dan aktif
            const productMap = new Map(
                products.map((product) => [product.sku, product])
            );

            for (const sku of productSkus) {
                const product = productMap.get(sku);

                if (!product || !product.isActive) {
                    throw new Error("PRODUCT_NOT_FOUND");
                }
            }

            // 5. Hitung subtotal dan total menggunakan Decimal
            let totalAmount = new Prisma.Decimal(0);

            const purchaseItems = data.items.map((item) => {
                const product = productMap.get(item.productSku)!;

                const unitPrice = new Prisma.Decimal(item.unitPrice);
                const subtotal = unitPrice.mul(item.quantity);

                totalAmount = totalAmount.plus(subtotal);

                return {
                    productSku: product.sku,
                    productName: product.name,
                    unit: product.unit,
                    quantity: item.quantity,
                    unitPrice,
                    subtotal,
                };
            });

            // 6. Validasi pembayaran awal
            const initialPayment = new Prisma.Decimal(
                data.initialPayment
            );

            if (initialPayment.greaterThan(totalAmount)) {
                throw new Error("PAYMENT_EXCEEDS_TOTAL");
            }

            // 7. Generate nomor invoice
            const year = purchaseDate.getUTCFullYear();
            const month = String(
                purchaseDate.getUTCMonth() + 1
            ).padStart(2, "0");

            const prefix = `PUR-${year}${month}-`;

            const lastPurchase = await tx.purchase.findFirst({
                where: {
                    purchaseNumber: {
                        startsWith: prefix,
                    },
                },
                orderBy: {
                    purchaseNumber: "desc",
                },
                select: {
                    purchaseNumber: true,
                },
            });

            const lastNumber = lastPurchase
                ? Number(lastPurchase.purchaseNumber.slice(prefix.length))
                : 0;

            const purchaseNumber =
                `${prefix}${String(lastNumber + 1).padStart(4, "0")}`;

            // 8. Simpan Purchase beserta item dan pembayaran awal
            return await tx.purchase.create({
                data: {
                    purchaseNumber,
                    purchaseDate,

                    supplierCode: supplier.supplierCode,
                    supplierName: supplier.name,

                    totalAmount,

                    items: {
                        create: purchaseItems,
                    },

                    payments: initialPayment.greaterThan(0)
                        ? {
                            create: {
                                paymentDate: purchaseDate,
                                amount: initialPayment,
                            },
                        }
                        : undefined,
                },
                include: {
                    items: true,
                    payments: true,
                },
            });
        });

        // 9. Respons berhasil
        return Response.json(
            {
                success: true,
                message: "Pembelian berhasil ditambahkan.",
                data: purchase,
            },
            { status: 201 }
        );

    } catch (error) {

        // Supplier tidak ditemukan atau tidak aktif
        if (
            error instanceof Error &&
            error.message === "SUPPLIER_NOT_FOUND"
        ) {
            return Response.json(
                {
                    success: false,
                    message: "Supplier tidak ditemukan atau tidak aktif.",
                },
                { status: 404 }
            );
        }

        // Produk tidak ditemukan atau tidak aktif
        if (
            error instanceof Error &&
            error.message === "PRODUCT_NOT_FOUND"
        ) {
            return Response.json(
                {
                    success: false,
                    message: "Salah satu produk tidak ditemukan atau tidak aktif.",
                },
                { status: 404 }
            );
        }

        // Pembayaran melebihi total pembelian
        if (
            error instanceof Error &&
            error.message === "PAYMENT_EXCEEDS_TOTAL"
        ) {
            return Response.json(
                {
                    success: false,
                    message: "Pembayaran awal tidak boleh melebihi total pembelian.",
                },
                { status: 400 }
            );
        }

        // Nomor invoice duplikat
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002"
        ) {
            return Response.json(
                {
                    success: false,
                    message: "Nomor invoice sudah digunakan. Silakan coba kembali.",
                },
                { status: 409 }
            );
        }

        console.error("POST /api/purchases error:", error);

        return Response.json(
            {
                success: false,
                message: "Gagal menambahkan pembelian.",
            },
            { status: 500 }
        );
    }
}
