# Aturan Akuntansi

## 1. Tujuan

Dokumen ini menjadi tempat pencatatan kebijakan akuntansi yang akan
diterapkan oleh aplikasi. Pada tahap awal, dokumen ini sengaja
membedakan prinsip umum dari kebijakan yang belum ditentukan.

## 2. Struktur pencatatan

Rancangan awal menggunakan: - `accounts` untuk bagan akun. -
`journal_entries` untuk header jurnal. - `journal_lines` untuk baris
jurnal.

Setiap baris jurnal akan mengacu pada akun dan memuat nilai debit atau
kredit sesuai desain final.

## 3. Prinsip yang perlu dijaga

-   Setiap jurnal yang diposting harus seimbang: total debit sama dengan
    total kredit.
-   Transaksi sumber harus dapat ditelusuri ke jurnal yang
    dihasilkannya.
-   Perubahan transaksi yang sudah diposting harus memiliki mekanisme
    koreksi yang dapat diaudit.
-   Pencatatan jurnal dan perubahan transaksi terkait harus konsisten.

## 4. Kebijakan yang belum difinalisasi

-   Basis pencatatan dan kebijakan pengakuan pendapatan/beban.
-   Struktur dan kode chart of accounts.
-   Periode akuntansi dan proses tutup buku.
-   Jurnal otomatis untuk pembelian, penjualan, pembayaran, penerimaan,
    dan HPP.
-   Pajak dan perlakuan diskon.
-   Retur dan pembalikan jurnal.
-   Penguncian periode serta hak akses posting.

Dokumen ini belum menetapkan jurnal debit/kredit spesifik untuk
transaksi. Jurnal contoh baru akan ditambahkan setelah kebijakan dan
alur transaksi disepakati.
