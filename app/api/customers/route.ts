import { prisma } from "@/lib/prisma";
import { createCustomerSchema } from "@/lib/validations/customer";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return Response.json({
      success: true,
      data: customers,
    });
  } catch (error) {
    console.error("GET /api/customers error:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengambil data pelanggan.",
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
    const validation = createCustomerSchema.safeParse(body);

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

    // 4. Simpan pelanggan ke database
    const customer = await prisma.customer.create({
      data: {
        customerCode: data.customerCode,
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
        message: "Pelanggan berhasil ditambahkan.",
        data: customer,
      },
      { status: 201 }
    );
  } catch (error) {
    // 6. Tangani customerCode duplikat
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return Response.json(
        {
          success: false,
          message: "Kode pelanggan sudah digunakan.",
        },
        { status: 409 }
      );
    }

    console.error("POST /api/customers error:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal menambahkan pelanggan.",
      },
      { status: 500 }
    );
  }
}

