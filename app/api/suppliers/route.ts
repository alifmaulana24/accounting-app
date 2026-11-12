import { prisma } from "@/lib/prisma";
import { createSupplierSchema } from "@/lib/validations/supplier";

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return Response.json({
      success: true,
      data: suppliers,
    });
  } catch (error) {
    console.error("GET /api/suppliers error:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengambil data supplier.",
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
    const validation = createSupplierSchema.safeParse(body);

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

    // 4. Simpan supplier ke database
    const supplier = await prisma.supplier.create({
      data: {
        supplierCode: data.supplierCode,
        name: data.name,
        phone: data.phone ?? null,
        email: data.email ?? null,
        address: data.address ?? null,
      },
    });

    // 5. Kirim respons berhasil
    return Response.json(
      {
        success: true,
        message: "Supplier berhasil ditambahkan.",
        data: supplier,
      },
      { status: 201 }
    );
  } catch (error) {
    // 6. Tangani supplierCode duplikat
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return Response.json(
        {
          success: false,
          message: "Kode supplier sudah digunakan.",
        },
        { status: 409 }
      );
    }

    console.error("POST /api/suppliers error:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal menambahkan supplier.",
      },
      { status: 500 }
    );
  }
}

