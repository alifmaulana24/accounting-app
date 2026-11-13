import { JournalDetailClient } from "@/components/journals/journal-detail-client";

export const instant = false;

export default async function DetailJurnalPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string | string[] }>;
}) {
  const [{ id }, { created }] = await Promise.all([params, searchParams]);

  return (
    <JournalDetailClient
      journalId={id}
      createdNotice={created === "1"}
    />
  );
}
