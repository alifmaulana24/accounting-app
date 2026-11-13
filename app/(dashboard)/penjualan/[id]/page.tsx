import { SaleDetailClient } from "@/components/sales/sale-detail-client";

export const instant = false;

export default async function DetailPenjualanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <SaleDetailClient saleId={id} />;
}
