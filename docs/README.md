# Dokumentasi Aplikasi Akuntansi

Dokumentasi ini menjadi sumber acuan desain untuk pengembangan aplikasi
akuntansi.

## Status rancangan

Dokumen ini merekam keputusan awal yang telah disepakati dan
memisahkannya dari usulan yang belum difinalisasi.

### Keputusan yang telah disepakati

-   Framework: Next.js.
-   Frontend dan backend berada dalam satu project Next.js.
-   Arsitektur backend: modular monolith.
-   Metode penilaian persediaan: FIFO (First In First Out).

### Usulan yang belum difinalisasi

-   Database: PostgreSQL.
-   ORM: Prisma.
-   Detail implementasi autentikasi, posting jurnal, retur, dan saldo
    awal.

## Daftar dokumen

-   [Arsitektur sistem](architecture.md)
-   [Desain database awal](database-design.md)
-   [Alur bisnis](business-flow.md)
-   [Aturan akuntansi](accounting-rules.md)
-   [Mekanisme persediaan FIFO](inventory-fifo.md)

## Prinsip perubahan

Setiap perubahan terhadap keputusan bisnis atau struktur data harus
diperbarui di dokumentasi terkait. Jangan menganggap usulan sebagai
keputusan final sebelum dikonfirmasi.
