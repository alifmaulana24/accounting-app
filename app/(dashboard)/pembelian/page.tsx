import { PurchasePageClient } from "@/components/purchases/purchase-page-client";

export const instant = false;

export default async function PembelianPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string | string[] }>;
}) {
  const { deleted } = await searchParams;

  return <PurchasePageClient showDeletedNotice={deleted === "1"} />;
}
