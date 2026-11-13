import { PurchaseDetailClient } from "@/components/purchases/purchase-detail-client";

export const instant = false;

export default async function DetailPembelianPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string | string[] }>;
}) {
  const [{ id }, { created }] = await Promise.all([params, searchParams]);

  return (
    <PurchaseDetailClient
      purchaseId={id}
      showCreatedNotice={created === "1"}
    />
  );
}
