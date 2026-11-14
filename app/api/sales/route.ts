
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { createSaleSchema } from "@/lib/validations/sale";
import { createJournalEntry } from "@/lib/journal";

// POST: Create Sale
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validate request body
    const validation = createSaleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi gagal",
          errors: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 2. Validate duplicate SKU
    const skus = data.items.map((item) => item.productSku);
    const uniqueSkus = new Set(skus);

    if (uniqueSkus.size !== skus.length) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Produk yang sama tidak boleh dimasukkan lebih dari satu kali.",
        },
        { status: 400 }
      );
    }

    // 3. Convert sale date
    const saleDate = new Date(`${data.saleDate}T00:00:00.000Z`);

    // 4. Database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check customer
      const customer = await tx.customer.findUnique({
        where: {
          customerCode: data.customerCode,
        },
      });

      if (!customer || !customer.isActive) {
        throw new Error("CUSTOMER_NOT_FOUND");
      }

      // Check products
      const products = await tx.product.findMany({
        where: {
          sku: {
            in: skus,
          },
          isActive: true,
        },
      });

      if (products.length !== skus.length) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      const productMap = new Map(
        products.map((product) => [product.sku, product])
      );

      // Calculate item subtotal and total amount
      const items = data.items.map((item) => {
        const product = productMap.get(item.productSku);

        if (!product) {
          throw new Error("PRODUCT_NOT_FOUND");
        }

        const unitPrice = new Prisma.Decimal(item.unitPrice);
        const quantity = new Prisma.Decimal(item.quantity);
        const subtotal = quantity.mul(unitPrice);

        return {
          productSku: product.sku,
          productName: product.name,
          unit: product.unit,
          quantity: item.quantity,
          unitPrice,
          subtotal,
        };
      });

      const totalAmount = items.reduce(
        (total, item) => total.add(item.subtotal),
        new Prisma.Decimal(0)
      );

      // Validate initial payment
      const initialPayment = new Prisma.Decimal(data.initialPayment);

      if (initialPayment.isNegative()) {
        throw new Error("INVALID_INITIAL_PAYMENT");
      }

      if (initialPayment.gt(totalAmount)) {
        throw new Error("PAYMENT_EXCEEDS_TOTAL");
      }

      const outstandingAmount = totalAmount.sub(initialPayment);

      // Generate sale number: SAL-YYYYMM-NNNN
      const yearMonth = data.saleDate.slice(0, 7).replace("-", "");
      const prefix = `SAL-${yearMonth}-`;

      const lastSale = await tx.sale.findFirst({
        where: {
          saleNumber: {
            startsWith: prefix,
          },
        },
        orderBy: {
          saleNumber: "desc",
        },
        select: {
          saleNumber: true,
        },
      });

      const lastSequence = lastSale
        ? Number(lastSale.saleNumber.slice(-4))
        : 0;

      const saleNumber = `${prefix}${String(lastSequence + 1).padStart(4, "0")}`;

      // Create sale with items and optional initial payment
      const sale = await tx.sale.create({
        data: {
          saleNumber,
          saleDate,
          customerCode: customer.customerCode,
          customerName: customer.name,
          totalAmount,

          items: {
            create: items,
          },

          ...(initialPayment.gt(0) && {
            payments: {
              create: {
                paymentDate: saleDate,
                amount: initialPayment,
              },
            },
          }),
        },
        include: {
          items: true,
          payments: true,
        },
      });

      // Create main journal for sale
      const journalLines = [];

      // Debit Cash for initial payment
      if (initialPayment.gt(0)) {
        journalLines.push({
          accountCode: "101",
          description: "Penerimaan pembayaran penjualan",
          debit: initialPayment,
          credit: new Prisma.Decimal(0),
        });
      }

      // Debit Accounts Receivable for outstanding amount
      if (outstandingAmount.gt(0)) {
        journalLines.push({
          accountCode: "103",
          description: "Piutang usaha penjualan",
          debit: outstandingAmount,
          credit: new Prisma.Decimal(0),
        });
      }

      // Credit Sales
      journalLines.push({
        accountCode: "401",
        description: "Penjualan",
        debit: new Prisma.Decimal(0),
        credit: totalAmount,
      });

      await createJournalEntry(tx, {
        journalDate: saleDate,
        description: `Penjualan ${saleNumber}`,
        sourceType: "SALE",
        sourceId: sale.id,
        lines: journalLines,
      });

      return sale;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Penjualan berhasil dibuat.",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Sale Error:", error);

    if (error instanceof Error) {
      const errorMessages: Record<string, string> = {
        CUSTOMER_NOT_FOUND: "Customer tidak ditemukan atau tidak aktif.",
        PRODUCT_NOT_FOUND:
          "Satu atau lebih produk tidak ditemukan atau tidak aktif.",
        PAYMENT_EXCEEDS_TOTAL: "Pembayaran melebihi total penjualan.",
        INVALID_INITIAL_PAYMENT: "Pembayaran awal tidak boleh negatif.",
        ACCOUNT_NOT_FOUND: "Akun COA untuk jurnal tidak ditemukan.",
        ACCOUNT_INACTIVE: "Akun COA untuk jurnal tidak aktif.",
        INVALID_JOURNAL_BALANCE: "Jurnal tidak seimbang.",
      };

      if (errorMessages[error.message]) {
        return NextResponse.json(
          {
            success: false,
            message: errorMessages[error.message],
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat membuat penjualan.",
      },
      { status: 500 }
    );
  }
}

// GET: List Sales
export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: [
        {
          saleDate: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      include: {
        payments: {
          select: {
            amount: true,
          },
        },
      },
    });

    const result = sales.map((sale) => {
      const totalPaid = sale.payments.reduce(
        (total, payment) => total.add(payment.amount),
        new Prisma.Decimal(0)
      );

      const outstandingAmount = sale.totalAmount.sub(totalPaid);

      let paymentStatus: string;

      if (totalPaid.equals(0)) {
        paymentStatus = "Belum Dibayar";
      } else if (totalPaid.gte(sale.totalAmount)) {
        paymentStatus = "Lunas";
      } else {
        paymentStatus = "Sebagian";
      }

      return {
        id: sale.id,
        saleNumber: sale.saleNumber,
        saleDate: sale.saleDate,
        customerCode: sale.customerCode,
        customerName: sale.customerName,
        totalAmount: Number(sale.totalAmount),
        totalPaid: Number(totalPaid),
        outstandingAmount: Number(outstandingAmount),
        paymentStatus,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get Sales Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil data penjualan.",
      },
      { status: 500 }
    );
  }
}
