import { Warehouse, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const instant = false;

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Inventory
          </h1>
          <Badge variant="secondary" className="gap-1 font-normal">
            <Clock className="size-3" />
            Dalam Pengembangan
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola stok barang, mutasi gudang, dan penilaian persediaan FIFO.
        </p>
      </div>

      {/* Placeholder content card */}
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-8 text-center shadow-xs">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Warehouse className="size-7" />
        </div>
        <h2 className="mt-4 text-base font-semibold text-foreground">
          Modul Inventory Sedang Disiapkan
        </h2>
        <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
          Fitur monitoring kuantitas stok produk, kartu stok, mutasi persediaan, dan perhitungan harga pokok penjualan (HPP) FIFO akan tersedia pada tahap pengembangan selanjutnya.
        </p>
      </div>
    </div>
  );
}

