import { prisma } from "./lib/prisma";

async function main() {
  const products = await prisma.product.findMany();

  console.log("Koneksi database berhasil!");
  console.log("Jumlah produk:", products.length);
  console.log("Data produk:", products);
}

main()
  .catch((error) => {
    console.error("Koneksi database gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });