
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const defaultAccounts = [
  { code: "101", name: "Kas", accountType: "ASSET", normalBalance: "DEBIT" },
  { code: "102", name: "Bank", accountType: "ASSET", normalBalance: "DEBIT" },
  { code: "103", name: "Piutang Usaha", accountType: "ASSET", normalBalance: "DEBIT" },
  { code: "104", name: "Persediaan Barang Dagang", accountType: "ASSET", normalBalance: "DEBIT" },
  { code: "201", name: "Utang Usaha", accountType: "LIABILITY", normalBalance: "CREDIT" },
  { code: "301", name: "Modal Pemilik", accountType: "EQUITY", normalBalance: "CREDIT" },
  { code: "401", name: "Penjualan", accountType: "REVENUE", normalBalance: "CREDIT" },
  { code: "402", name: "Retur Penjualan", accountType: "REVENUE", normalBalance: "DEBIT" },
] as const;

async function main() {
  for (const account of defaultAccounts) {
    await prisma.account.upsert({
      where: { code: account.code },
      update: {},
      create: {
        ...account,
        isSystem: true,
        isActive: true,
      },
    });
  }

  console.log("Default COA berhasil diinisialisasi.");
}

main()
  .catch((error) => {
    console.error("Gagal menginisialisasi COA:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
