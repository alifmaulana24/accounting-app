
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { createAccountSchema } from "@/lib/validations/account";

// GET /api/accounts
export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: {
        code: "asc",
      },
    });

    return NextResponse.json({
      data: accounts,
    });
  } catch (error) {
    console.error("GET accounts error:", error);

    return NextResponse.json(
      { error: "Gagal mengambil data akun" },
      { status: 500 }
    );
  }
}

// POST /api/accounts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createAccountSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validasi gagal",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const account = await prisma.account.create({
      data: {
        ...validation.data,
        isSystem: false,
      },
    });

    return NextResponse.json(
      {
        message: "Akun berhasil ditambahkan",
        data: account,
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Kode akun sudah digunakan" },
        { status: 409 }
      );
    }

    console.error("POST accounts error:", error);

    return NextResponse.json(
      { error: "Gagal menambahkan akun" },
      { status: 500 }
    );
  }
}
