
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { updateAccountSchema } from "@/lib/validations/account";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET: Mengambil detail akun berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const account = await prisma.account.findUnique({
      where: { id },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Akun tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: account });
  } catch (error) {
    console.error("GET account detail error:", error);

    return NextResponse.json(
      { error: "Gagal mengambil detail akun" },
      { status: 500 }
    );
  }
}

// PATCH: Memperbarui akun
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validation = updateAccountSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validasi gagal",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const existingAccount = await prisma.account.findUnique({
      where: { id },
    });

    if (!existingAccount) {
      return NextResponse.json(
        { error: "Akun tidak ditemukan" },
        { status: 404 }
      );
    }

    const updatedAccount = await prisma.account.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json({
      message: "Akun berhasil diperbarui",
      data: updatedAccount,
    });
  } catch (error) {
    console.error("PATCH account error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Kode akun sudah digunakan" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Gagal memperbarui akun" },
      { status: 500 }
    );
  }
}

// DELETE: Menghapus akun
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const existingAccount = await prisma.account.findUnique({
      where: { id },
    });

    if (!existingAccount) {
      return NextResponse.json(
        { error: "Akun tidak ditemukan" },
        { status: 404 }
      );
    }

    // Akun bawaan sistem tidak boleh dihapus
    if (existingAccount.isSystem) {
      return NextResponse.json(
        { error: "Akun bawaan sistem tidak dapat dihapus" },
        { status: 403 }
      );
    }

    await prisma.account.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Akun berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE account error:", error);

    // Akun masih memiliki relasi dengan data lain
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        { error: "Akun tidak dapat dihapus karena masih digunakan" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Gagal menghapus akun" },
      { status: 500 }
    );
  }
}
