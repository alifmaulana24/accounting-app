# Alur Bisnis

## 1. Tujuan

Dokumen ini menggambarkan alur bisnis tingkat tinggi yang menjadi dasar pengembangan modul Master Data, pembelian, penjualan, persediaan, dan akuntansi.

## 2. Prinsip Master Data

Master Data merupakan sumber data utama (*single source of truth*) untuk pemasok, pelanggan, dan produk.

- Data pemasok dibuat dan dikelola melalui modul Master Data, lalu dipilih ketika pengguna membuat pembelian.
- Data pelanggan dibuat dan dikelola melalui modul Master Data, lalu dipilih ketika pengguna membuat penjualan.
- Data produk dibuat dan dikelola melalui modul Master Data, lalu dipilih sebagai item pembelian maupun penjualan.
- Purchasing dan Sales menggunakan referensi ID dari Master Data, bukan membuat master pemasok, pelanggan, atau produk duplikat di dalam transaksi.
- Perubahan data master tidak boleh mengubah nilai historis dokumen transaksi yang sudah dibuat.

## 3. Alur pembelian

1. Pengguna memastikan pemasok sudah terdaftar pada Master Data.
2. Pengguna memilih pemasok dari daftar `suppliers`.
3. Pengguna membuat transaksi pembelian.
4. Pengguna memilih produk dari daftar `products` dan memasukkan kuantitas.
5. Sistem menyimpan header dan detail pembelian beserta referensi master data.
6. Sistem menyimpan nilai transaksi saat itu, seperti harga beli, kuantitas, diskon, dan informasi historis lain yang diperlukan.
7. Penerimaan barang menambah kuantitas persediaan dan membentuk layer biaya FIFO.
8. Pembayaran kepada pemasok dicatat melalui riwayat pembayaran.

Catatan: apakah pencatatan pembelian dan penerimaan barang terjadi pada satu tahap atau tahap terpisah belum diputuskan.

## 4. Alur penjualan

1. Pengguna memastikan produk sudah terdaftar pada Master Data.
2. Pengguna memilih pelanggan dari daftar `customers` (jika transaksi mensyaratkan pelanggan).
3. Pengguna membuat transaksi penjualan.
4. Pengguna memilih produk dari daftar `products` dan memasukkan kuantitas.
5. Sistem memeriksa ketersediaan stok.
6. Sistem menyimpan referensi Master Data dan snapshot nilai transaksi pada saat transaksi dibuat.
7. Sistem mengalokasikan kuantitas dari layer FIFO tertua yang masih memiliki stok.
8. Sistem menghitung HPP berdasarkan biaya layer yang terpakai.
9. Sistem mencatat transaksi dan penerimaan pembayaran sesuai status pembayaran.

Detail waktu pengurangan stok, status transaksi, dan aturan penjualan kredit masih perlu difinalisasi.

## 5. Alur persediaan

- Pembelian atau penerimaan barang menambah stok.
- Penjualan atau pengeluaran barang mengurangi stok.
- Pemakaian stok harus dapat ditelusuri ke layer persediaan asal.
- Perubahan nama atau harga default produk di Master Data tidak mengubah biaya layer FIFO yang sudah terbentuk.
- Penyesuaian dan retur akan ditambahkan setelah aturan bisnisnya disepakati.

## 6. Alur akuntansi

Transaksi bisnis yang memenuhi aturan pengakuan akuntansi akan menghasilkan jurnal. Jurnal memiliki header dan baris akun debit/kredit.

Jurnal dan laporan historis harus menggunakan nilai transaksi yang tersimpan, bukan mengambil ulang harga atau nama terkini dari Master Data untuk menggantikan nilai historis.

Pemetaan akun dan aturan jurnal otomatis per jenis transaksi belum difinalisasi. Jangan membuat asumsi akun atau jurnal final tanpa persetujuan aturan akuntansi.

## 7. Prinsip menjaga histori

- Master Data menjadi referensi utama untuk transaksi baru.
- Transaksi menyimpan foreign key ke entitas master terkait.
- Informasi yang diperlukan untuk merekonstruksi dokumen lama disimpan sebagai snapshot pada saat transaksi dibuat atau diposting, sesuai kebijakan final.
- Master Data yang telah digunakan sebaiknya dinonaktifkan, bukan dihapus permanen.
- Koreksi transaksi yang sudah diposting harus mengikuti mekanisme audit dan pembalikan yang akan ditetapkan.
