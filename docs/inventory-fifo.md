# Mekanisme Persediaan FIFO

## 1. Metode penilaian

Aplikasi menggunakan FIFO (*First In, First Out*). Artinya, kuantitas
persediaan yang diperoleh lebih dahulu dianggap keluar lebih dahulu
ketika terjadi pemakaian atau penjualan.

## 2. Konsep inventory layer

Setiap penerimaan persediaan membentuk layer yang menyimpan informasi
seperti: - Produk. - Tanggal penerimaan atau tanggal layer. - Kuantitas
awal. - Kuantitas tersisa. - Biaya per unit. - Referensi transaksi
sumber.

Nama dan detail kolom final masih perlu ditetapkan dalam desain
database.

## 3. Alokasi saat stok keluar

Ketika terjadi penjualan atau pengeluaran: 1. Sistem mencari layer
produk yang masih memiliki kuantitas. 2. Layer diurutkan dari yang
paling lama sesuai kebijakan tanggal FIFO. 3. Sistem mengambil kuantitas
dari layer tertua terlebih dahulu. 4. Jika satu layer tidak mencukupi,
sistem melanjutkan ke layer berikutnya. 5. Sistem menyimpan detail
alokasi agar biaya persediaan yang keluar dapat ditelusuri.

## 4. Ilustrasi

Misalnya tersedia: - Layer A: 10 unit dengan biaya Rp10.000 per unit. -
Layer B: 15 unit dengan biaya Rp12.000 per unit.

Jika terjual 12 unit: - 10 unit dialokasikan dari Layer A. - 2 unit
dialokasikan dari Layer B.

HPP = (10 × Rp10.000) + (2 × Rp12.000) = Rp124.000.

Sisa persediaan: - Layer A: 0 unit. - Layer B: 13 unit.

## 5. Tabel yang terkait

-   `inventory_layers`: menyimpan lapisan persediaan.
-   `inventory_layer_allocations`: menyimpan hubungan pengeluaran dengan
    layer yang digunakan.
-   `stock_movements`: menyimpan catatan pergerakan stok.

`purchase_items` menjadi salah satu kandidat sumber pembentukan layer,
sedangkan `sales_items` menjadi salah satu kandidat sumber alokasi
layer.

## 6. Aturan yang belum diputuskan

-   Definisi tanggal yang menentukan urutan FIFO.
-   Penanganan stok negatif.
-   Saldo awal dan layer pembuka.
-   Retur pembelian dan penjualan.
-   Biaya angkut dan biaya lain yang masuk ke biaya perolehan.
-   Pembatalan transaksi setelah layer digunakan.
-   Penyesuaian stok dan stock opname.
-   Presisi kuantitas dan pembulatan biaya.

Aturan tersebut harus diputuskan sebelum implementasi FIFO dianggap
final.
