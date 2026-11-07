import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sku: string }> }
) {
  try {
    const { sku } = await params;
    const product = await prisma.product.findUnique({
      where: { sku },
    });

    if (!product) {
      return Response.json(
        {
          success: false,
          message: "Produk tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("GET /api/products/[sku] error:", error);
    return Response.json(
      {
        success: false,
        message: "Gagal mengambil data produk.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ sku: string }> }
) {
  try {
    const { sku } = await params;

    await prisma.product.delete({
      where: { sku },
    });

    return Response.json(
      {
        success: true,
        message: "Produk berhasil dihapus.",
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
          message: "Produk tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    console.error("DELETE /api/products/[sku] error:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal menghapus produk.",
      },
      { status: 500 }
    );
  }
}