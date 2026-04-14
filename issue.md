# Feature: Impor Data Kanji dari XML (Seeder)

## Deskripsi Tugas
Tugas ini adalah mengimplementasikan proses *seeding* database untuk mengisi tabel `kanjis` dengan ribuan data kanji yang diambil dari file `kanjidic2.xml`. Kita akan menggunakan skrip `seed.js` yang sudah disiapkan untuk memproses file XML tersebut dan menyimpannya ke MySQL menggunakan Prisma.

## Sumber Daya yang Tersedia
- **File Data**: `kanjidic2.xml` (Database Kanji lengkap dalam format XML).
- **Skrip Seeder**: `seed.js` (Skrip Node.js yang menggunakan `PrismaClient` dan `fast-xml-parser`).

## Panduan Teknis & Tahapan Implementasi

Ikuti langkah-langkah berikut untuk menjalankan proses seeding:

### 1. Persiapan File
- Pastikan file `kanjidic2.xml` dan `seed.js` berada di lokasi yang benar.
- Pindahkan atau copy file `seed.js` ke dalam folder `backend/prisma/seed.js` (atau lokasi standar seeding Prisma Anda).
- Pastikan file `kanjidic2.xml` berada di root folder `backend/` atau sesuaikan variabel `XML_PATH` di dalam `seed.js`.

### 2. Instalasi Dependensi
Skrip seeding ini membutuhkan pustaka untuk memproses XML. Jalankan perintah berikut di folder `backend/`:
```bash
bun add fast-xml-parser
```

### 3. Penyesuaian skrip `seed.js` (PENTING)
Karena saat ini kita baru membuat tabel `kanjis` dan belum membuat tabel `kotobas` atau `user_kanjis`, baris kode yang mencoba menghapus data di tabel tersebut akan menyebabkan error.

- Buka file `seed.js`.
- Cari blok kode pembersihan data lama (sekitar baris 131-132).
- **Komentari (comment out)** baris berikut:
  ```javascript
  // await prisma.kotoba.deleteMany()
  // await prisma.userKanji.deleteMany()
  ```
- Biarkan baris `await prisma.kanji.deleteMany()` aktif jika Anda ingin mengosongkan tabel kanji sebelum diisi ulang.

### 4. Eksekusi Seeding
Jalankan proses import dengan perintah Prisma:
```bash
bun x prisma db seed
```

### 5. Verifikasi Akhir
- Perhatikan output di terminal untuk melihat progres batch insert (Progress: X/Y).
- Setelah selesai, buka **Prisma Studio** (`bun x prisma studio`) untuk memastikan data kanji sudah masuk dengan atribut lengkap (onyomi, kunyomi, meaning, dll).

## Catatan Tambahan
- Skrip ini memfilter kanji berdasarkan level JLPT (N5 hingga N2). Jika ingin mengimpor semua, sesuaikan variabel `JLPT_FILTER`.
- Proses ini mungkin memakan waktu beberapa menit karena ukuran XML yang besar (>15MB). Jangan hentikan proses sebelum muncul pesan "Seeding selesai!".
