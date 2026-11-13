import { SalePageClient } from "@/components/sales/sale-page-client";

export const instant = false;

export default async function PenjualanPage({
  searchParams,
}: {
  searchParams: Promise<{
    created?: string | string[];
    deleted?: string | string[];
  }>;
}) {
  const { created, deleted } = await searchParams;

  const notice =
    created === "1" ? "created" : deleted === "1" ? "deleted" : null;

  return <SalePageClient notice={notice} />;
}

