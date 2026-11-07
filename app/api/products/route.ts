
import { prisma } from "@/lib/prisma";

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
