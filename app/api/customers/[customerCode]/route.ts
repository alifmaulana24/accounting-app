import { prisma } from "@/lib/prisma";
import { editCustomerSchema } from "@/lib/validations/customer";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ customerCode: string }> }
) {
  try {
    const { customerCode } = await params;
    const customer = await prisma.customer.findUnique({
      where: { customerCode },
    });

    if (!customer) {
      return Response.json(
        {
          success: false,
          message: "Pelanggan tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("GET /api/customers/[customerCode] error:", error);
    return Response.json(
      {
        success: false,
        message: "Gagal mengambil data pelanggan.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ customerCode: string }> }
) {
  try {
    const { customerCode } = await params;
    const body = await request.json();

    const validation = editCustomerSchema.safeParse(body);

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

    const customer = await prisma.customer.update({
      where: { customerCode },
      data: {
        name: data.name,
        phone: data.phone ?? null,
        email: data.email ?? null,
        address: data.address ?? null,
        isActive: data.isActive,
      },
    });

    return Response.json(
      {
        success: true,
        message: "Pelanggan berhasil diperbarui.",
        data: customer,
      },
      { status: 200 }
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return Response.json(
        {
          success: false,
          message: "Pelanggan tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    console.error("PATCH /api/customers/[customerCode] error:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal memperbarui pelanggan.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ customerCode: string }> }
) {
  try {
    const { customerCode } = await params;

    await prisma.customer.delete({
      where: { customerCode },
    });

    return Response.json(
      {
        success: true,
        message: "Pelanggan berhasil dihapus.",
      },
      { status: 200 }
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return Response.json(
        {
          success: false,
          message: "Pelanggan tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    console.error("DELETE /api/customers/[customerCode] error:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal menghapus pelanggan.",
      },
      { status: 500 }
    );
  }
}

