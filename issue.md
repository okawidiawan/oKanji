# Feature: Menambahkan Schema Prisma untuk Kotoba, KanjiKotoba, dan UserKotoba

## 1. Background & Tujuan
Tujuan dari issue ini adalah menambahkan tiga model baru pada skema database Prisma, yaitu `Kotoba`, `KanjiKotoba`, dan `UserKotoba`. Penambahan skema ini merupakan pondasi awal untuk mendukung fitur manajemen kosakata (kotoba) dan pelacakan progres hafalan kosakata oleh masing-masing pengguna (user kotoba), sesuai dengan rencana pengembangan fitur yang ada pada dokumen arsitektur proyek.

## 2. Spesifikasi Teknis (Endpoint, Request, Response)
Fitur ini memiliki batasan yang terfokus **hanya** pada pembaruan/penambahan model schema pada file Prisma, sehingga belum mencakup pembuatan controller atau router API baru.

- **Endpoint**: N/A (Perubahan hanya terjadi pada level Database Schema)
- **Request**: N/A
- **Response**: N/A

*Catatan: Implementasi endpoint API untuk Kotoba dan User Kotoba (seperti POST, PATCH, DELETE) akan dikerjakan pada issue/tahapan yang terpisah.*

## 3. Step-by-step Implementasi per File

1. **`backend/prisma/schema.prisma`**
   - Tambahkan model `Kotoba` dengan kolom `id`, `word`, `reading`, `meaning`, `jlptLevel`, `createdAt`, beserta relasi array ke `KanjiKotoba` dan `UserKotoba`.
   - Set mapping tabel menggunakan `@@map("kotoba")`.
   - Tambahkan model `KanjiKotoba` sebagai *junction table* (Many-to-Many) antara `Kanji` dan `Kotoba` dengan field `kanjiId` dan `kotobaId` sebagai *composite key* `@@id([kanjiId, kotobaId])`, dengan relasi `onDelete: Cascade`.
   - Set mapping tabel menggunakan `@@map("kanji_kotoba")`.
   - Tambahkan model `UserKotoba` untuk merekam progres hafalan tiap user terhadap suatu kotoba, dengan *unique constraint* `@@unique([userId, kotobaId])` serta relasi `onDelete: Cascade`.
   - Set mapping tabel menggunakan `@@map("user_kotoba")`.
   - Cek dan pastikan pada model `Kanji` yang sudah ada ditambahkan *back-relation* ke `KanjiKotoba` (`kanjiKotoba KanjiKotoba[]`).
   - Cek dan pastikan pada model `User` yang sudah ada ditambahkan *back-relation* ke `UserKotoba` (`userKotoba UserKotoba[]`).

2. **Terminal (Command Line Execution)**
   - Jalankan perintah `npx prisma format` untuk merapikan format dan memvalidasi `schema.prisma`.
   - Jalankan perintah `npx prisma db push` untuk melakukan sinkronisasi/push perubahan skema ke database MySQL.
   - Jalankan perintah `npx prisma generate` untuk men-*generate* ulang Prisma Client agar model baru (`Kotoba`, dll) terdeteksi pada proyek backend.

## 4. Acceptance Criteria
- [ ] Skema untuk model `Kotoba`, `KanjiKotoba`, dan `UserKotoba` telah tertulis dengan benar di dalam `backend/prisma/schema.prisma`.
- [ ] Relasi *Cascade* dan properti tipe data pada ketiga model baru terdefinisi sesuai spesifikasi di atas.
- [ ] *Back-relation* pada model `Kanji` dan `User` telah ditambahkan untuk menghindari error pada Prisma.
- [ ] Command `npx prisma format` berhasil dijalankan tanpa error validasi skema.
- [ ] Command `npx prisma db push` berhasil mengeksekusi migrasi skema tabel ke dalam database MySQL.
- [ ] Command `npx prisma generate` berhasil memperbarui tipe dari Prisma Client.
- [ ] Tidak ada file/kode di luar lingkup Prisma (seperti backend logic/frontend) yang diubah pada issue ini.
