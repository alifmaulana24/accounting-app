
import { prisma } from "@/lib/prisma";
import { createProductSchema } from "@/lib/validations/product";

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            orderBy: {
                name: "asc",
            },
        });

        return Response.json({
            success: true,
            data: products,
        });
    } catch (error) {
        console.error("GET /api/products error:", error);

        return Response.json(
            {
                success: false,
                message: "Gagal mengambil data produk.",
            },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
  try {
    // 1. Ambil data dari request body
    const body = await request.json();

    // 2. Validasi data menggunakan Zod
    const validation = createProductSchema.safeParse(body);

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

    // 3. Ambil data yang sudah tervalidasi
    const data = validation.data;

    // 4. Simpan produk ke database
    const product = await prisma.product.create({
      data: {
        sku: data.sku,
        name: data.name,
        category: data.category,
        brand: data.brand?.trim() || null,
        unit: data.unit,
      },
    });

    // 5. Kirim respons berhasil
    return Response.json(
      {
        success: true,
        message: "Produk berhasil ditambahkan.",
        data: product,
      },
      { status: 201 }
    );
  } catch (error) {
    // 6. Tangani SKU duplikat
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return Response.json(
        {
          success: false,
          message: "SKU sudah digunakan.",
        },
        { status: 409 }
      );
    }

    console.error("POST /api/products error:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal menambahkan produk.",
      },
      { status: 500 }
    );
  }
}