export function formatRupiah(value: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function formatJournalDate(value: string, month: "short" | "long" = "short") {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month,
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
