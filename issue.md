# Fitur Penyimpanan Progress Hafalan Kanji User (User Kanji)

## Deskripsi Tugas
Kita akan menambahkan fitur baru yang memungkinkan pengguna (user) untuk menyimpan dan melacak progress hafalan kanji mereka. Ini mencakup apakah kanji sudah dihafal, jumlah review yang sudah dilakukan, tingkat kesulitan menurut user, dan catatan pribadi.

## Schema Database (Prisma)
Tambahkan model berikut ke dalam file `prisma/schema.prisma`:

```prisma
model UserKanji {
  id           String    @id @default(uuid())
  userId       String
  kanjiId      String
  isMemorized  Boolean   @default(false)
  reviewCount  Int       @default(0)
  difficulty   Int?      // Rating kesulitan dari user: 1 (mudah) - 5 (sulit)
  note         String?   @db.Text      // Catatan pribadi user untuk kanji ini
  lastReviewed DateTime?
  memorizedAt  DateTime?              // Kapan pertama kali ditandai hafal
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  kanji Kanji @relation(fields: [kanjiId], references: [id], onDelete: Cascade)
  
  @@unique([userId, kanjiId])
  @@map("user_kanji")
}
```

**Perhatian**: Pastikan juga untuk menambahkan relasi balikan (_opposite relation_) pada model `User` dan `Kanji` yang sudah ada di dalam skema.
Contoh:
- Di dalam model `User`: `userKanjis UserKanji[]`
- Di dalam model `Kanji`: `userKanjis UserKanji[]`

---

## Tahapan Implementasi (Step-by-Step)

Untuk mengimplementasikan fitur ini, ikuti langkah-langkah berikut secara berurutan:

### 1. Update Database Schema & Migration
1. Buka file `prisma/schema.prisma`.
2. Tambahkan model `UserKanji` beserta relasi balikannya di model `User` dan `Kanji` seperti yang didefinisikan di atas.
3. Jalankan perintah migrasi database untuk menerapkan perubahan ini ke database:
   ```bash
   npx prisma migrate dev --name add_user_kanji_model
   ```
4. Perintah di atas seharusnya juga secara otomatis menjalankan `npx prisma generate` untuk memperbarui Prisma Client. Jika tidak, jalankan secara manual.

### 2. Pembuatan Validasi (Validation / Zod)
Buat skema validasi untuk request body yang masuk, misalnya menggunakan Zod (jika proyek ini menggunakannya):
1. Buat skema untuk menyimpan data (Create): Perlu `kanjiId`. Opsional: `difficulty`, `note`.
2. Buat skema untuk memperbarui data (Update): Opsional: `isMemorized`, `difficulty`, `note`. 

### 3. Pembuatan Service / Controller (Backend)
Buat logic untuk mengelola data `user_kanji`. Ini bisa berada di `user-kanji-service.ts` / `user-kanji-controller.ts` (sesuaikan dengan struktur folder proyek):

1. **Fitur Tambah/Update Progress**: 
   - Buat endpoint `POST /api/user-kanji` atau `PUT /api/user-kanji/:kanjiId`
   - Logika: 
     - Periksa apakah user yang sedang login sudah memiliki record untuk `kanjiId` ini (cek menggunakan `userId` dan `kanjiId`). 
     - Jika *belum ada*, buat record baru (Create).
     - Jika *sudah ada*, perbarui data yang ada (Update).
     - Jika `isMemorized` diubah menjadi `true` untuk pertama kalinya, isi `memorizedAt` dengan tanggal dan waktu saat ini.
     - Tambahkan +1 pada `reviewCount` atau perbarui `lastReviewed` ke jam saat ini (sesuaikan dengan desain fitur jika mereka mereview).
2. **Fitur Ambil Daftar Kanji User**:
   - Buat endpoint `GET /api/user-kanji` 
   - Logika: Ambil semua daftar kanji milik user yang sedang aktif login (`where: { userId: currentUserId }`). Ini juga harus bisa mendukung fitur *pagination* atau filter (misalnya filter `isMemorized = true`).
3. **Fitur Ambil Detail Progress Satu Kanji**:
   - Buat endpoint `GET /api/user-kanji/:kanjiId`
   - Logika: Ambil progress belajar user untuk spesifik kanji tertentu.

### 4. Setup Routes & Middleware (Backend)
1. Daftarkan controller/handler yang sudah dibuat di dalam file routing (misalnya `routes.ts` atau `user-kanji.route.ts`).
2. **SANGAT PENTING**: Pastikan semua endpoint untuk fitur ini dilindungi oleh **Authentication Middleware**. Hanya user yang sudah terautentikasi (login) yang boleh mengakses dan mengubah data ini, dan mereka hanya boleh membaca/mengubah data milik mereka sendiri.

### 5. Penulisan Unit Test (Testing)
1. Buat file konfirmasi test (misal `user-kanji.test.ts`).
2. Pastikan menulis test untuk:
   - Berhasil membuat progress kanji baru.
   - Berhasil mengupdate progress kanji (contoh: menandai sudah hafal).
   - Gagal jika mengakses data tanpa token login (Unauthorized).
   - Berhasil mengambil daftar kanji yang sudah dipelajari.

### 6. Dokumentasi API
1. Update dokumentasi API (jika menggunakan Swagger/OpenAPI atau markdown) dengan rincian endpoint baru, contoh request, dan response.

---

**Catatan untuk Implementator**: Kerjakan satu layer dalam satu waktu. Mulailah dari Prisma -> Validation -> Service -> Controller -> Routes -> Tests. Lakukan commit secara berkala untuk memudahkan review.
