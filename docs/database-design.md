# Desain Database Awal

## 1. Tujuan

Dokumen ini mencatat rancangan awal entitas database untuk aplikasi akuntansi. Rancangan masih bersifat konseptual dan perlu divalidasi sebelum dibuat menjadi migration atau schema final.

## 2. Prinsip Master Data

Master Data menjadi sumber referensi utama (*single source of truth*) untuk data pemasok, pelanggan, dan produk.

- Purchasing memilih pemasok dari `suppliers` dan produk dari `products`.
- Sales memilih pelanggan dari `customers` dan produk dari `products`.
- Transaksi tidak membuat salinan master pemasok, pelanggan, atau produk sebagai entitas baru.
- Setiap transaksi menyimpan foreign key ke data master yang relevan.
- Data master yang sudah digunakan dalam transaksi sebaiknya dinonaktifkan (*soft deactivate*) daripada dihapus secara permanen, agar histori transaksi tetap dapat ditelusuri.

## 3. Daftar tabel awal

### Master data

| Tabel | Fungsi awal |
|---|---|
| `users` | Menyimpan data pengguna aplikasi |
| `categories` | Mengelompokkan produk |
| `products` | Menyimpan master produk |
| `suppliers` | Menyimpan data pemasok |
| `customers` | Menyimpan data pelanggan |

### Pembelian

| Tabel | Fungsi awal |
|---|---|
| `purchases` | Header transaksi pembelian; mengacu pada `suppliers` |
| `purchase_items` | Detail item pembelian; mengacu pada `products` |
| `supplier_payments` | Riwayat pembayaran kepada pemasok |

### Penjualan

| Tabel | Fungsi awal |
|---|---|
| `sales` | Header transaksi penjualan; mengacu pada `customers` |
| `sales_items` | Detail item penjualan; mengacu pada `products` |
| `customer_receipts` | Riwayat penerimaan pembayaran pelanggan |

### Persediaan FIFO

| Tabel | Fungsi awal |
|---|---|
| `inventory_layers` | Menyimpan lapisan persediaan beserta kuantitas dan biaya perolehan |
| `inventory_layer_allocations` | Mencatat alokasi kuantitas dari layer ketika stok digunakan |
| `stock_movements` | Mencatat pergerakan stok |

### Akuntansi

| Tabel | Fungsi awal |
|---|---|
| `accounts` | Bagan akun (chart of accounts) |
| `journal_entries` | Header jurnal |
| `journal_lines` | Baris debit dan kredit jurnal |

## 4. Relasi konseptual awal

- `categories` berelasi dengan `products`.
- `suppliers` memiliki relasi dengan banyak `purchases`.
- `purchases` memiliki banyak `purchase_items`.
- Setiap `purchase_items` mengacu pada satu `products`.
- `customers` memiliki relasi dengan banyak `sales`.
- `sales` memiliki banyak `sales_items`.
- Setiap `sales_items` mengacu pada satu `products`.
- `products` menjadi referensi item pembelian, penjualan, dan persediaan.
- `inventory_layers` menyimpan layer biaya persediaan.
- `inventory_layer_allocations` menghubungkan pemakaian stok dengan layer asalnya.
- `journal_entries` memiliki banyak `journal_lines`.
- `accounts` direferensikan oleh `journal_lines`.

Relasi tersebut merupakan gambaran awal. Kardinalitas, foreign key, aturan penghapusan, indeks, unique constraint, dan nullable fields belum difinalisasi.

## 5. Historical Snapshot pada transaksi

Foreign key ke Master Data menjaga hubungan transaksi dengan data asal. Namun, transaksi juga perlu menyimpan snapshot informasi yang relevan pada saat transaksi dibuat agar histori tidak berubah ketika Master Data diperbarui.

Contoh informasi snapshot yang perlu dipertimbangkan:

### Pada `purchases` dan `purchase_items`
- Nomor dokumen dan tanggal transaksi.
- Referensi `supplier_id`.
- Nama atau alamat pemasok saat transaksi, jika dibutuhkan untuk dokumen historis.
- Referensi `product_id`.
- Nama atau SKU produk saat transaksi, jika dibutuhkan untuk tampilan historis.
- Kuantitas, satuan, harga beli, diskon, pajak, dan nilai baris sesuai kebijakan final.

### Pada `sales` dan `sales_items`
- Nomor dokumen dan tanggal transaksi.
- Referensi `customer_id`.
- Nama atau alamat pelanggan saat transaksi, jika dibutuhkan untuk dokumen historis.
- Referensi `product_id`.
- Nama atau SKU produk saat transaksi, jika dibutuhkan untuk tampilan historis.
- Kuantitas, satuan, harga jual, diskon, pajak, dan nilai baris sesuai kebijakan final.

Snapshot bukan pengganti foreign key. Foreign key tetap dipakai untuk menghubungkan transaksi ke Master Data, sedangkan snapshot menyimpan nilai historis yang diperlukan. Kolom snapshot dan aturan kapan snapshot dibuat perlu ditetapkan pada desain skema final.

Harga transaksi harus disimpan sebagai nilai transaksi, bukan dibaca ulang dari harga default produk ketika laporan historis ditampilkan. Demikian juga, biaya perolehan layer FIFO harus menyimpan biaya pada saat persediaan diterima.

## 6. Catatan desain penting

- Header dan detail transaksi dipisahkan.
- Pembayaran dipisahkan dari header transaksi agar pembayaran bertahap dapat dimodelkan.
- HPP penjualan harus berasal dari alokasi layer FIFO, bukan angka yang diinput sembarangan.
- `sales_items` sebelumnya diusulkan memiliki nilai HPP (`cogs`) hasil perhitungan FIFO. Cara penyimpanan finalnya masih perlu ditentukan agar tidak menduplikasi sumber data alokasi.
- Stok harus dapat ditelusuri melalui catatan pergerakan dan alokasi layer.
- Data master yang sudah direferensikan transaksi tidak boleh dihapus secara fisik tanpa kebijakan retensi dan integritas histori yang jelas.

## 7. Hal yang belum diputuskan

- Saldo awal persediaan dan pembentukan layer awal.
- Retur pembelian dan retur penjualan.
- Penyesuaian stok dan stock opname.
- Pembatalan transaksi dan pembalikan jurnal.
- Pajak, diskon, biaya tambahan, serta biaya perolehan persediaan.
- Mata uang dan periode akuntansi.
- Soft delete/deactivate, audit trail, serta aturan nomor dokumen.
- Field snapshot historis yang wajib disimpan pada setiap dokumen.
- Apakah pemasok atau pelanggan boleh memiliki banyak alamat/kontak.

Jangan menganggap daftar 17 tabel ini sebagai schema final sebelum keputusan di atas dianalisis.
