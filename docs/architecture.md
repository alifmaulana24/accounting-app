# Arsitektur Sistem

## 1. Tujuan

Aplikasi dirancang sebagai sistem akuntansi terintegrasi yang menangani
data master, pembelian, penjualan, persediaan, dan pencatatan akuntansi.

## 2. Keputusan arsitektur

-   Menggunakan Next.js sebagai framework full-stack.
-   Frontend dan backend dikelola dalam satu codebase.
-   Menggunakan pendekatan modular monolith: setiap domain bisnis
    memiliki batas tanggung jawab yang jelas, tetapi berjalan dalam satu
    aplikasi.
-   Metode penilaian persediaan menggunakan FIFO.

## 3. Modul domain awal

  -----------------------------------------------------------------------
  Modul                               Tanggung jawab
  ----------------------------------- -----------------------------------
  Master Data                         Pengelolaan pengguna, produk,
                                      kategori, pemasok, dan pelanggan

  Purchasing                          Pencatatan pembelian dan pembayaran
                                      pemasok

  Sales                               Pencatatan penjualan dan penerimaan
                                      pembayaran pelanggan

  Inventory                           Pergerakan stok, lapisan biaya
                                      FIFO, dan alokasi stok

  Accounting                          Bagan akun dan jurnal umum

  Reporting                           Laporan berdasarkan data transaksi
                                      dan akuntansi
  -----------------------------------------------------------------------

Modul-modul tersebut merupakan pengelompokan domain awal. Batas detail
layanan dan dependensi antarmodul akan ditetapkan saat implementasi.

## 4. Struktur direktori yang diusulkan

``` text
src/
  app/
    api/
  components/
  modules/
    master-data/
    purchasing/
    sales/
    inventory/
    accounting/
    reporting/
  lib/
  types/
```

Struktur ini adalah usulan awal, bukan struktur final. Implementasi
harus mengikuti dokumentasi Next.js yang terpasang di project.

## 5. Transaksi dan konsistensi data

Operasi yang mengubah beberapa data terkait---misalnya menyimpan
transaksi penjualan sekaligus mengurangi stok dan mencatat
jurnal---harus dirancang agar konsisten. Gunakan transaksi database
ketika beberapa perubahan harus berhasil atau gagal sebagai satu
kesatuan.

## 6. Teknologi database

PostgreSQL dan Prisma pernah diusulkan sebagai pilihan database dan ORM,
tetapi belum ditetapkan sebagai keputusan final.
