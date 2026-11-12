import { prisma } from "@/lib/prisma";
import { editSupplierSchema } from "@/lib/validations/supplier";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ supplierCode: string }> }
) {
  try {
    const { supplierCode } = await params;
    const supplier = await prisma.supplier.findUnique({
      where: { supplierCode },
    });

    if (!supplier) {
      return Response.json(
        {
          success: false,
          message: "Supplier tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    console.error("GET /api/suppliers/[supplierCode] error:", error);
    return Response.json(
      {
        success: false,
        message: "Gagal mengambil data supplier.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ supplierCode: string }> }
) {
  try {
    const { supplierCode } = await params;
    const body = await request.json();

    const validation = editSupplierSchema.safeParse(body);

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

    const supplier = await prisma.supplier.update({
      where: { supplierCode },
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
        message: "Supplier berhasil diperbarui.",
        data: supplier,
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
          message: "Supplier tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    console.error("PATCH /api/suppliers/[supplierCode] error:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal memperbarui supplier.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ supplierCode: string }> }
) {
  try {
    const { supplierCode } = await params;

    await prisma.supplier.delete({
      where: { supplierCode },
    });

    return Response.json(
      {
        success: true,
        message: "Supplier berhasil dihapus.",
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
          message: "Supplier tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    console.error("DELETE /api/suppliers/[supplierCode] error:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal menghapus supplier.",
      },
      { status: 500 }
    );
  }
}

